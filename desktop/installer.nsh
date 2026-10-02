!include "WinVer.nsh"

!macro customInit
  ${IfNot} ${AtLeastWin10}
    MessageBox MB_OK|MB_ICONSTOP "Turizm Muhasebe bu bilgisayara kurulamadı.$\r$\n$\r$\nBu sürüm Windows 10 veya Windows 11 gerektirir. Windows 7, 8 ve 8.1 desteklenmez.$\r$\n$\r$\nWindows 10/11 için aynı kurulum hem 32 hem 64 bit bilgisayarlarda kullanılabilir."
    Quit
  ${EndIf}
!macroend
