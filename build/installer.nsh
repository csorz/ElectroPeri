; ElectroPeri NSIS 自定义安装脚本

!macro customInstall
  ; 创建数据目录
  CreateDirectory "$APPDATA\ElectroPeri"
  CreateDirectory "$APPDATA\ElectroPeri\logs"
  CreateDirectory "$APPDATA\ElectroPeri\config"
!macroend

!macro customUnInstall
  ; 卸载时询问是否删除用户数据
  MessageBox MB_YESNO "是否删除用户数据目录？$\n($APPDATA\ElectroPeri)" IDYES delete_data IDNO keep_data
  delete_data:
    RMDir /r "$APPDATA\ElectroPeri"
  keep_data:
!macroend
