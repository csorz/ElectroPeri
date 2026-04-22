#include <node_api.h>
#include <windows.h>
#include <stdio.h>
#include <string.h>

// --- Globals ---
static napi_threadsafe_function g_tsfn = NULL;
static HWND g_hwnd = NULL;
static HANDLE g_thread = NULL;
static volatile int g_running = 0;
static napi_ref g_callback_ref = NULL;

// --- VKey name lookup (common keys) ---
static const char* vkey_name(UINT vk) {
    static char buf[8];
    switch (vk) {
        case 0x08: return "Backspace";
        case 0x09: return "Tab";
        case 0x0D: return "Enter";
        case 0x10: return "Shift";
        case 0x11: return "Ctrl";
        case 0x12: return "Alt";
        case 0x13: return "Pause";
        case 0x14: return "CapsLock";
        case 0x1B: return "Esc";
        case 0x20: return "Space";
        case 0x21: return "PageUp";
        case 0x22: return "PageDown";
        case 0x23: return "End";
        case 0x24: return "Home";
        case 0x25: return "Left";
        case 0x26: return "Up";
        case 0x27: return "Right";
        case 0x28: return "Down";
        case 0x2C: return "PrintScreen";
        case 0x2D: return "Insert";
        case 0x2E: return "Delete";
        case 0x5B: return "LWin";
        case 0x5C: return "RWin";
        case 0x5D: return "Apps";
        case 0x5F: return "Sleep";
        case 0x60: return "Num0";
        case 0x61: return "Num1";
        case 0x62: return "Num2";
        case 0x63: return "Num3";
        case 0x64: return "Num4";
        case 0x65: return "Num5";
        case 0x66: return "Num6";
        case 0x67: return "Num7";
        case 0x68: return "Num8";
        case 0x69: return "Num9";
        case 0x6A: return "Multiply";
        case 0x6B: return "Add";
        case 0x6C: return "Separator";
        case 0x6D: return "Subtract";
        case 0x6E: return "Decimal";
        case 0x6F: return "Divide";
        case 0x70: return "F1";
        case 0x71: return "F2";
        case 0x72: return "F3";
        case 0x73: return "F4";
        case 0x74: return "F5";
        case 0x75: return "F6";
        case 0x76: return "F7";
        case 0x77: return "F8";
        case 0x78: return "F9";
        case 0x79: return "F10";
        case 0x7A: return "F11";
        case 0x7B: return "F12";
        case 0x90: return "NumLock";
        case 0x91: return "ScrollLock";
        case 0xA0: return "LShift";
        case 0xA1: return "RShift";
        case 0xA2: return "LCtrl";
        case 0xA3: return "RCtrl";
        case 0xA4: return "LAlt";
        case 0xA5: return "RAlt";
        default:
            if (vk >= 0x30 && vk <= 0x39) { snprintf(buf, sizeof(buf), "%c", '0' + (vk - 0x30)); return buf; }
            if (vk >= 0x41 && vk <= 0x5A) { snprintf(buf, sizeof(buf), "%c", 'A' + (vk - 0x41)); return buf; }
            snprintf(buf, sizeof(buf), "0x%02X", vk);
            return buf;
    }
}

// --- Key event struct passed to JS thread ---
typedef struct {
    HANDLE hDevice;
    UINT vKey;
    UINT scanCode;
    BOOL keyDown;
    char keyName[32];
} KeyEvent;

// --- Call JS callback from main thread ---
static void call_js(napi_env env, napi_value js_cb, void* context, void* data) {
    if (env == NULL || js_cb == NULL) return;
    KeyEvent* evt = (KeyEvent*)data;

    napi_value obj;
    napi_create_object(env, &obj);

    napi_value handle_val;
    napi_create_int64(env, (int64_t)evt->hDevice, &handle_val);
    napi_set_named_property(env, obj, "handle", handle_val);

    napi_value vkey_val;
    napi_create_uint32(env, evt->vKey, &vkey_val);
    napi_set_named_property(env, obj, "vKey", vkey_val);

    napi_value scan_val;
    napi_create_uint32(env, evt->scanCode, &scan_val);
    napi_set_named_property(env, obj, "scanCode", scan_val);

    napi_value down_val;
    napi_get_boolean(env, evt->keyDown, &down_val);
    napi_set_named_property(env, obj, "keyDown", down_val);

    napi_value name_val;
    napi_create_string_utf8(env, evt->keyName, NAPI_AUTO_LENGTH, &name_val);
    napi_set_named_property(env, obj, "keyName", name_val);

    napi_value undefined;
    napi_get_undefined(env, &undefined);
    napi_call_function(env, undefined, js_cb, 1, &obj, NULL);

    free(evt);
}

// --- Window procedure ---
static LRESULT CALLBACK wnd_proc(HWND hwnd, UINT msg, WPARAM wp, LPARAM lp) {
    if (msg == WM_INPUT && g_tsfn) {
        UINT size = 0;
        GetRawInputData((HRAWINPUT)lp, RID_INPUT, NULL, &size, sizeof(RAWINPUTHEADER));
        if (size > 0) {
            RAWINPUT* ri = (RAWINPUT*)malloc(size);
            if (ri && GetRawInputData((HRAWINPUT)lp, RID_INPUT, ri, &size, sizeof(RAWINPUTHEADER)) == size) {
                if (ri->header.dwType == RIM_TYPEKEYBOARD) {
                    KeyEvent* evt = (KeyEvent*)malloc(sizeof(KeyEvent));
                    if (evt) {
                        evt->hDevice = ri->header.hDevice;
                        evt->vKey = ri->data.keyboard.VKey;
                        evt->scanCode = ri->data.keyboard.MakeCode;
                        evt->keyDown = (ri->data.keyboard.Flags & RI_KEY_BREAK) ? FALSE : TRUE;
                        strncpy(evt->keyName, vkey_name(ri->data.keyboard.VKey), sizeof(evt->keyName) - 1);
                        evt->keyName[sizeof(evt->keyName) - 1] = '\0';
                        napi_call_threadsafe_function(g_tsfn, evt, napi_tsfn_nonblocking);
                    }
                }
            }
            if (ri) free(ri);
        }
        DefWindowProc(hwnd, msg, wp, lp);
        return 0;
    }
    if (msg == WM_CLOSE) {
        g_running = 0;
        PostQuitMessage(0);
        return 0;
    }
    return DefWindowProc(hwnd, msg, wp, lp);
}

// --- Listener thread ---
static DWORD WINAPI listener_thread(LPVOID param) {
    WNDCLASSA wc = {0};
    wc.lpfnWndProc = wnd_proc;
    wc.lpszClassName = "RawKeyboardListener";
    RegisterClassA(&wc);

    g_hwnd = CreateWindowExA(0, "RawKeyboardListener", "RawKbdHidden", 0, 0, 0, 0, 0, HWND_MESSAGE, NULL, NULL, NULL);

    if (g_hwnd) {
        RAWINPUTDEVICE rid;
        rid.usUsagePage = 0x01;
        rid.usUsage = 0x06;
        rid.dwFlags = RIDEV_INPUTSINK;
        rid.hwndTarget = g_hwnd;
        RegisterRawInputDevices(&rid, 1, sizeof(rid));

        MSG msg;
        while (g_running && GetMessage(&msg, NULL, 0, 0)) {
            TranslateMessage(&msg);
            DispatchMessage(&msg);
        }
        DestroyWindow(g_hwnd);
        g_hwnd = NULL;
    }

    UnregisterClassA("RawKeyboardListener", NULL);
    return 0;
}

// --- N-API: getKeyboardDevices ---
static napi_value get_keyboard_devices(napi_env env, napi_callback_info info) {
    UINT num = 0;
    GetRawInputDeviceList(NULL, &num, sizeof(RAWINPUTDEVICELIST));
    if (num == 0) {
        napi_value arr;
        napi_create_array(env, &arr);
        return arr;
    }

    RAWINPUTDEVICELIST* list = (RAWINPUTDEVICELIST*)malloc(sizeof(RAWINPUTDEVICELIST) * num);
    UINT count = GetRawInputDeviceList(list, &num, sizeof(RAWINPUTDEVICELIST));

    napi_value result;
    napi_create_array(env, &result);
    uint32_t idx = 0;

    for (UINT i = 0; i < count; i++) {
        if (list[i].dwType != RIM_TYPEKEYBOARD) continue;

        // Get device name
        UINT name_len = 0;
        GetRawInputDeviceInfoA(list[i].hDevice, RIDI_DEVICENAME, NULL, &name_len);
        char* name_buf = NULL;
        if (name_len > 0) {
            name_buf = (char*)malloc(name_len);
            GetRawInputDeviceInfoA(list[i].hDevice, RIDI_DEVICENAME, name_buf, &name_len);
        }

        // Parse VID/PID from device name (format: \\?\hid#vid_xxxx&pid_yyyy...)
        int vid = 0, pid = 0;
        if (name_buf) {
            char* vid_str = strstr(name_buf, "vid_");
            char* pid_str = strstr(name_buf, "pid_");
            if (vid_str) vid = (int)strtol(vid_str + 4, NULL, 16);
            if (pid_str) pid = (int)strtol(pid_str + 4, NULL, 16);
        }

        napi_value obj;
        napi_create_object(env, &obj);

        napi_value handle_val;
        napi_create_int64(env, (int64_t)list[i].hDevice, &handle_val);
        napi_set_named_property(env, obj, "handle", handle_val);

        napi_value name_val;
        napi_create_string_utf8(env, name_buf ? name_buf : "", NAPI_AUTO_LENGTH, &name_val);
        napi_set_named_property(env, obj, "name", name_val);

        napi_value vid_val;
        napi_create_int32(env, vid, &vid_val);
        napi_set_named_property(env, obj, "vid", vid_val);

        napi_value pid_val;
        napi_create_int32(env, pid, &pid_val);
        napi_set_named_property(env, obj, "pid", pid_val);

        napi_set_element(env, result, idx, obj);
        idx++;

        if (name_buf) free(name_buf);
    }

    free(list);
    return result;
}

// --- N-API: startRawInput ---
static napi_value start_raw_input(napi_env env, napi_callback_info info) {
    size_t argc = 1;
    napi_value args[1];
    napi_get_cb_info(env, info, &argc, args, NULL, NULL);

    if (g_running) {
        napi_value result;
        napi_create_object(env, &result);
        napi_value success;
        napi_get_boolean(env, true, &success);
        napi_set_named_property(env, result, "success", success);
        return result;
    }

    napi_value work_name;
    napi_create_string_utf8(env, "RawKeyboard", NAPI_AUTO_LENGTH, &work_name);

    napi_value cb = args[0];
    napi_create_threadsafe_function(env, cb, NULL, work_name, 0, 1, NULL, NULL, NULL, call_js, &g_tsfn);

    g_running = 1;
    g_thread = CreateThread(NULL, 0, listener_thread, NULL, 0, NULL);

    napi_value result;
    napi_create_object(env, &result);
    napi_value success;
    napi_get_boolean(env, true, &success);
    napi_set_named_property(env, result, "success", success);
    return result;
}

// --- N-API: stopRawInput ---
static napi_value stop_raw_input(napi_env env, napi_callback_info info) {
    if (!g_running) {
        napi_value result;
        napi_create_object(env, &result);
        napi_value success;
        napi_get_boolean(env, true, &success);
        napi_set_named_property(env, result, "success", success);
        return result;
    }

    g_running = 0;
    if (g_hwnd) PostMessage(g_hwnd, WM_CLOSE, 0, 0);
    if (g_thread) {
        WaitForSingleObject(g_thread, 3000);
        CloseHandle(g_thread);
        g_thread = NULL;
    }
    if (g_tsfn) {
        napi_release_threadsafe_function(g_tsfn, napi_tsfn_abort);
        g_tsfn = NULL;
    }

    napi_value result;
    napi_create_object(env, &result);
    napi_value success;
    napi_get_boolean(env, true, &success);
    napi_set_named_property(env, result, "success", success);
    return result;
}

// --- Module init ---
static napi_value init(napi_env env, napi_value exports) {
    napi_value fn1, fn2, fn3;
    napi_create_function(env, "getKeyboardDevices", NAPI_AUTO_LENGTH, get_keyboard_devices, NULL, &fn1);
    napi_set_named_property(env, exports, "getKeyboardDevices", fn1);
    napi_create_function(env, "startRawInput", NAPI_AUTO_LENGTH, start_raw_input, NULL, &fn2);
    napi_set_named_property(env, exports, "startRawInput", fn2);
    napi_create_function(env, "stopRawInput", NAPI_AUTO_LENGTH, stop_raw_input, NULL, &fn3);
    napi_set_named_property(env, exports, "stopRawInput", fn3);
    return exports;
}

NAPI_MODULE(raw_keyboard, init)
