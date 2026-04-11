import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'

// P0 - 全栈工具箱 - Category pages
import EncodingCategoryPage from './pages/p0/categories/EncodingCategoryPage'
import JsonCategoryPage from './pages/p0/categories/JsonCategoryPage'
import UrlCategoryPage from './pages/p0/categories/UrlCategoryPage'
import TimeCategoryPage from './pages/p0/categories/TimeCategoryPage'
import HttpCategoryPage from './pages/p0/categories/HttpCategoryPage'
import TextCategoryPage from './pages/p0/categories/TextCategoryPage'
import ColorCategoryPage from './pages/p0/categories/ColorCategoryPage'
import CssCategoryPage from './pages/p0/categories/CssCategoryPage'
import ImageCategoryPage from './pages/p0/categories/ImageCategoryPage'
import MarkdownCategoryPage from './pages/p0/categories/MarkdownCategoryPage'
import CodeCategoryPage from './pages/p0/categories/CodeCategoryPage'
import DevCategoryPage from './pages/p0/categories/DevCategoryPage'
import SeoCategoryPage from './pages/p0/categories/SeoCategoryPage'
import OcrCategoryPage from './pages/p0/categories/OcrCategoryPage'
import UtilsCategoryPage from './pages/p0/categories/UtilsCategoryPage'
import FunCategoryPage from './pages/p0/categories/FunCategoryPage'

// Encoding tools
import HashToolPage from './pages/p0/tools/HashToolPage'
import Base64ToolPage from './pages/p0/tools/Base64ToolPage'
import UrlEncodeToolPage from './pages/p0/tools/UrlEncodeToolPage'
import EncryptToolPage from './pages/p0/tools/EncryptToolPage'
import UnicodeToolPage from './pages/p0/tools/UnicodeToolPage'

// JSON tools
import JsonFormatToolPage from './pages/p0/tools/JsonFormatToolPage'
import JsonMinifyToolPage from './pages/p0/tools/JsonMinifyToolPage'
import JsonValidateToolPage from './pages/p0/tools/JsonValidateToolPage'
import JsonToYamlToolPage from './pages/p0/tools/JsonToYamlToolPage'
import JsonToCsvToolPage from './pages/p0/tools/JsonToCsvToolPage'

// URL tools
import ShortUrlToolPage from './pages/p0/tools/ShortUrlToolPage'
import QueryParserToolPage from './pages/p0/tools/QueryParserToolPage'

// Time tools
import TimestampToolPage from './pages/p0/tools/TimestampToolPage'
import CurrentTimeToolPage from './pages/p0/tools/CurrentTimeToolPage'
import TimezoneToolPage from './pages/p0/tools/TimezoneToolPage'

// HTTP tools
import HttpRequestToolPage from './pages/p0/tools/HttpRequestToolPage'
import WebSocketToolPage from './pages/p0/tools/WebSocketToolPage'
import HttpStatusToolPage from './pages/p0/tools/HttpStatusToolPage'

// Text tools
import RegexToolPage from './pages/p0/tools/RegexToolPage'
import TextDiffToolPage from './pages/p0/tools/TextDiffToolPage'
import CsvJsonToolPage from './pages/p0/tools/CsvJsonToolPage'
import YamlJsonToolPage from './pages/p0/tools/YamlJsonToolPage'
import WordCountToolPage from './pages/p0/tools/WordCountToolPage'

// Color tools
import ColorConvertToolPage from './pages/p0/tools/ColorConvertToolPage'
import ColorPaletteToolPage from './pages/p0/tools/ColorPaletteToolPage'
import GradientGeneratorToolPage from './pages/p0/tools/GradientGeneratorToolPage'
import ContrastToolPage from './pages/p0/tools/ContrastToolPage'
import ColorPickerToolPage from './pages/p0/tools/ColorPickerToolPage'

// CSS tools
import ShadowGeneratorToolPage from './pages/p0/tools/ShadowGeneratorToolPage'
import ButtonDesignerToolPage from './pages/p0/tools/ButtonDesignerToolPage'
import GridGeneratorToolPage from './pages/p0/tools/GridGeneratorToolPage'
import BackgroundGeneratorToolPage from './pages/p0/tools/BackgroundGeneratorToolPage'
import CssFormatToolPage from './pages/p0/tools/CssFormatToolPage'

// Image tools
import ImageCompressToolPage from './pages/p0/tools/ImageCompressToolPage'
import ImageConvertToolPage from './pages/p0/tools/ImageConvertToolPage'
import ImageBase64ToolPage from './pages/p0/tools/ImageBase64ToolPage'
import WatermarkToolPage from './pages/p0/tools/WatermarkToolPage'
import QrCodeToolPage from './pages/p0/tools/QrCodeToolPage'

// Markdown tools
import MarkdownEditorToolPage from './pages/p0/tools/MarkdownEditorToolPage'
import MarkdownTableToolPage from './pages/p0/tools/MarkdownTableToolPage'
import HtmlMdToolPage from './pages/p0/tools/HtmlMdToolPage'

// Code tools
import JsRunnerToolPage from './pages/p0/tools/JsRunnerToolPage'
import PythonRunnerToolPage from './pages/p0/tools/PythonRunnerToolPage'
import JavaRunnerToolPage from './pages/p0/tools/JavaRunnerToolPage'
import GoRunnerToolPage from './pages/p0/tools/GoRunnerToolPage'
import RustRunnerToolPage from './pages/p0/tools/RustRunnerToolPage'

// Dev tools
import UuidGeneratorToolPage from './pages/p0/tools/UuidGeneratorToolPage'
import JwtToolPage from './pages/p0/tools/JwtToolPage'
import CronGeneratorToolPage from './pages/p0/tools/CronGeneratorToolPage'
import RandomPasswordToolPage from './pages/p0/tools/RandomPasswordToolPage'

// SEO tools
import IpQueryToolPage from './pages/p0/tools/IpQueryToolPage'
import WhoisToolPage from './pages/p0/tools/WhoisToolPage'
import MetaCheckerToolPage from './pages/p0/tools/MetaCheckerToolPage'
import DnsQueryToolPage from './pages/p0/tools/DnsQueryToolPage'

// OCR tools
import OcrToolPage from './pages/p0/tools/OcrToolPage'
import SvgEditorToolPage from './pages/p0/tools/SvgEditorToolPage'

// Utils tools
import VideoParserToolPage from './pages/p0/tools/VideoParserToolPage'
import FileTransferToolPage from './pages/p0/tools/FileTransferToolPage'
import PhoneLookupToolPage from './pages/p0/tools/PhoneLookupToolPage'

// Fun tools
import PianoToolPage from './pages/p0/tools/PianoToolPage'
import VoiceSynthesisToolPage from './pages/p0/tools/VoiceSynthesisToolPage'
import AvatarGeneratorToolPage from './pages/p0/tools/AvatarGeneratorToolPage'

// P1 - 工业核心接口
import SerialPage from './pages/p1/SerialPage'
import WebSerialPage from './pages/p1/WebSerialPage'
import UsbPage from './pages/p1/UsbPage'
import BluetoothPage from './pages/p1/BluetoothPage'
import HidPage from './pages/p1/HidPage'
import NetworkPage from './pages/p1/NetworkPage'

// P2 - 系统与终端能力
import SystemPage from './pages/p2/SystemPage'
import StoragePage from './pages/p2/StoragePage'
import DisplayPage from './pages/p2/DisplayPage'
import PowerPage from './pages/p2/PowerPage'
import ProcessPage from './pages/p2/ProcessPage'
import PrinterPage from './pages/p2/PrinterPage'
import MediaPage from './pages/p2/MediaPage'

// P4 - 嵌入式扩展接口
import GpioPage from './pages/p4/GpioPage'
import I2cPage from './pages/p4/I2cPage'
import SpiPage from './pages/p4/SpiPage'
import OnewirePage from './pages/p4/OnewirePage'

import './assets/main.css'

function App(): React.JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="home" element={<HomePage />} />
          <Route path="serial" element={<SerialPage />} />
          <Route path="usb" element={<UsbPage />} />
          <Route path="bluetooth" element={<BluetoothPage />} />
          <Route path="hid" element={<HidPage />} />
          <Route path="network" element={<NetworkPage />} />
          <Route path="gpio" element={<GpioPage />} />
          <Route path="i2c" element={<I2cPage />} />
          <Route path="spi" element={<SpiPage />} />
          <Route path="onewire" element={<OnewirePage />} />
          <Route path="system" element={<SystemPage />} />
          <Route path="storage" element={<StoragePage />} />
          <Route path="display" element={<DisplayPage />} />
          <Route path="power" element={<PowerPage />} />
          <Route path="process" element={<ProcessPage />} />
          <Route path="printer" element={<PrinterPage />} />
          <Route path="media" element={<MediaPage />} />
          <Route path="web-serial" element={<WebSerialPage />} />

          {/* Encoding Category & Tools */}
          <Route path="frontend-toolbox/encoding" element={<EncodingCategoryPage />} />
          <Route path="frontend-toolbox/encoding/hash" element={<HashToolPage />} />
          <Route path="frontend-toolbox/encoding/base64" element={<Base64ToolPage />} />
          <Route path="frontend-toolbox/encoding/url" element={<UrlEncodeToolPage />} />
          <Route path="frontend-toolbox/encoding/encrypt" element={<EncryptToolPage />} />
          <Route path="frontend-toolbox/encoding/unicode" element={<UnicodeToolPage />} />

          {/* JSON Category & Tools */}
          <Route path="frontend-toolbox/json" element={<JsonCategoryPage />} />
          <Route path="frontend-toolbox/json/format" element={<JsonFormatToolPage />} />
          <Route path="frontend-toolbox/json/minify" element={<JsonMinifyToolPage />} />
          <Route path="frontend-toolbox/json/validate" element={<JsonValidateToolPage />} />
          <Route path="frontend-toolbox/json/to-yaml" element={<JsonToYamlToolPage />} />
          <Route path="frontend-toolbox/json/to-csv" element={<JsonToCsvToolPage />} />

          {/* URL Category & Tools */}
          <Route path="frontend-toolbox/url" element={<UrlCategoryPage />} />
          <Route path="frontend-toolbox/url/encode" element={<UrlEncodeToolPage />} />
          <Route path="frontend-toolbox/url/short" element={<ShortUrlToolPage />} />
          <Route path="frontend-toolbox/url/query" element={<QueryParserToolPage />} />

          {/* Time Category & Tools */}
          <Route path="frontend-toolbox/time" element={<TimeCategoryPage />} />
          <Route path="frontend-toolbox/time/stamp" element={<TimestampToolPage />} />
          <Route path="frontend-toolbox/time/now" element={<CurrentTimeToolPage />} />
          <Route path="frontend-toolbox/time/timezone" element={<TimezoneToolPage />} />

          {/* HTTP Category & Tools */}
          <Route path="frontend-toolbox/http" element={<HttpCategoryPage />} />
          <Route path="frontend-toolbox/http/request" element={<HttpRequestToolPage />} />
          <Route path="frontend-toolbox/http/websocket" element={<WebSocketToolPage />} />
          <Route path="frontend-toolbox/http/status" element={<HttpStatusToolPage />} />

          {/* Text Category & Tools */}
          <Route path="frontend-toolbox/text" element={<TextCategoryPage />} />
          <Route path="frontend-toolbox/text/regex" element={<RegexToolPage />} />
          <Route path="frontend-toolbox/text/diff" element={<TextDiffToolPage />} />
          <Route path="frontend-toolbox/text/csv-json" element={<CsvJsonToolPage />} />
          <Route path="frontend-toolbox/text/yaml-json" element={<YamlJsonToolPage />} />
          <Route path="frontend-toolbox/text/count" element={<WordCountToolPage />} />

          {/* Color Category & Tools */}
          <Route path="frontend-toolbox/color" element={<ColorCategoryPage />} />
          <Route path="frontend-toolbox/color/convert" element={<ColorConvertToolPage />} />
          <Route path="frontend-toolbox/color/palette" element={<ColorPaletteToolPage />} />
          <Route path="frontend-toolbox/color/gradient" element={<GradientGeneratorToolPage />} />
          <Route path="frontend-toolbox/color/contrast" element={<ContrastToolPage />} />
          <Route path="frontend-toolbox/color/picker" element={<ColorPickerToolPage />} />

          {/* CSS Category & Tools */}
          <Route path="frontend-toolbox/css" element={<CssCategoryPage />} />
          <Route path="frontend-toolbox/css/shadow" element={<ShadowGeneratorToolPage />} />
          <Route path="frontend-toolbox/css/button" element={<ButtonDesignerToolPage />} />
          <Route path="frontend-toolbox/css/grid" element={<GridGeneratorToolPage />} />
          <Route path="frontend-toolbox/css/background" element={<BackgroundGeneratorToolPage />} />
          <Route path="frontend-toolbox/css/format" element={<CssFormatToolPage />} />

          {/* Image Category & Tools */}
          <Route path="frontend-toolbox/image" element={<ImageCategoryPage />} />
          <Route path="frontend-toolbox/image/compress" element={<ImageCompressToolPage />} />
          <Route path="frontend-toolbox/image/convert" element={<ImageConvertToolPage />} />
          <Route path="frontend-toolbox/image/base64" element={<ImageBase64ToolPage />} />
          <Route path="frontend-toolbox/image/watermark" element={<WatermarkToolPage />} />
          <Route path="frontend-toolbox/image/qrcode" element={<QrCodeToolPage />} />

          {/* Markdown Category & Tools */}
          <Route path="frontend-toolbox/markdown" element={<MarkdownCategoryPage />} />
          <Route path="frontend-toolbox/markdown/editor" element={<MarkdownEditorToolPage />} />
          <Route path="frontend-toolbox/markdown/table" element={<MarkdownTableToolPage />} />
          <Route path="frontend-toolbox/markdown/html-md" element={<HtmlMdToolPage />} />

          {/* Code Category & Tools */}
          <Route path="frontend-toolbox/code" element={<CodeCategoryPage />} />
          <Route path="frontend-toolbox/code/js" element={<JsRunnerToolPage />} />
          <Route path="frontend-toolbox/code/python" element={<PythonRunnerToolPage />} />
          <Route path="frontend-toolbox/code/java" element={<JavaRunnerToolPage />} />
          <Route path="frontend-toolbox/code/go" element={<GoRunnerToolPage />} />
          <Route path="frontend-toolbox/code/rust" element={<RustRunnerToolPage />} />

          {/* Dev Category & Tools */}
          <Route path="frontend-toolbox/dev" element={<DevCategoryPage />} />
          <Route path="frontend-toolbox/dev/uuid" element={<UuidGeneratorToolPage />} />
          <Route path="frontend-toolbox/dev/jwt" element={<JwtToolPage />} />
          <Route path="frontend-toolbox/dev/cron" element={<CronGeneratorToolPage />} />
          <Route path="frontend-toolbox/dev/random" element={<RandomPasswordToolPage />} />

          {/* SEO Category & Tools */}
          <Route path="frontend-toolbox/seo" element={<SeoCategoryPage />} />
          <Route path="frontend-toolbox/seo/ip" element={<IpQueryToolPage />} />
          <Route path="frontend-toolbox/seo/whois" element={<WhoisToolPage />} />
          <Route path="frontend-toolbox/seo/meta" element={<MetaCheckerToolPage />} />
          <Route path="frontend-toolbox/seo/dns" element={<DnsQueryToolPage />} />

          {/* OCR Category & Tools */}
          <Route path="frontend-toolbox/ocr" element={<OcrCategoryPage />} />
          <Route path="frontend-toolbox/ocr/text" element={<OcrToolPage />} />
          <Route path="frontend-toolbox/ocr/svg" element={<SvgEditorToolPage />} />

          {/* Utils Category & Tools */}
          <Route path="frontend-toolbox/utils" element={<UtilsCategoryPage />} />
          <Route path="frontend-toolbox/utils/video" element={<VideoParserToolPage />} />
          <Route path="frontend-toolbox/utils/file" element={<FileTransferToolPage />} />
          <Route path="frontend-toolbox/utils/phone" element={<PhoneLookupToolPage />} />

          {/* Fun Category & Tools */}
          <Route path="frontend-toolbox/fun" element={<FunCategoryPage />} />
          <Route path="frontend-toolbox/fun/piano" element={<PianoToolPage />} />
          <Route path="frontend-toolbox/fun/voice" element={<VoiceSynthesisToolPage />} />
          <Route path="frontend-toolbox/fun/avatar" element={<AvatarGeneratorToolPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
