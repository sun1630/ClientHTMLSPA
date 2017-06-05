using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Windows;

namespace BOCTS.Client
{
    /// <summary>
    /// ThemeSwitcher所使用的主题枚举
    /// </summary>
    [Flags]
    public enum ThemeEnum
    {
        CLASSIC = 1,
        ROYALE = 2,
        LUNA = 4,
        LUNA_HOMESTEAD = 8,
        LUNA_METALLIC = 16,
        /// <summary>
        /// Vista默认主题
        /// </summary>
        AERO = 32
    }

    /// <summary>
    /// Theme切换
    /// </summary>
    public class ThemeSwitcher
    {
        /// <summary>
        /// 切换Theme
        /// </summary>
        /// <param name="theme">Theme枚举</param>
        /// <param name="element">FrameworkElement对象</param>
        public static void SwitchTheme(ThemeEnum theme, FrameworkElement element)
        {
            element.Resources.MergedDictionaries.Add(GetThemeResourceDictionary(theme));
        }

        //public static void UnloadTheme(ThemeEnum theme,FrameworkContentElement element) {
        //    element.Resources.MergedDictionaries.Remove(GetThemeResourceDictionary(theme));
        //}

        public static ResourceDictionary GetThemeResourceDictionary(ThemeEnum theme)
        {
            Uri uri = null;
         

            switch (theme)
            {
                //==================== CLASSIC ======================================
                //C:\Program Files\Reference Assemblies\Microsoft\Framework\v3.0\PresentationFramework.Classic.dll
                //classic
                case ThemeEnum.CLASSIC:
                    uri =
                        new Uri(
                            "/PresentationFramework.Classic, Version=3.0.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35;component/themes/classic.xaml",
                            UriKind.Relative);

                    break;
                //==================== ROYALE ======================================
                //C:\Program Files\Reference Assemblies\Microsoft\Framework\v3.0\PresentationFramework.Royale.dll
                //royale.normalcolor
                case ThemeEnum.ROYALE:
                    uri =
                        new Uri(
                            "/PresentationFramework.Royale, Version=3.0.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35;component/themes/royale.normalcolor.xaml",
                            UriKind.Relative);
                    break;
                //==================== LUNA ======================================
                //C:\Program Files\Reference Assemblies\Microsoft\Framework\v3.0\PresentationFramework.Luna.dll
                //luna.normalcolor
                case ThemeEnum.LUNA:
                    uri =
                        new Uri(
                            "/PresentationFramework.Luna, Version=3.0.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35;component/themes/luna.normalcolor.xaml",
                            UriKind.Relative);
                    break;
                //luna.homestead
                case ThemeEnum.LUNA_HOMESTEAD:
                    uri =
                        new Uri(
                            "/PresentationFramework.Luna, Version=3.0.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35;component/themes/luna.homestead.xaml",
                            UriKind.Relative);
                    break;
                //luna.metallic
                case ThemeEnum.LUNA_METALLIC:
                    uri =
                        new Uri(
                            "/PresentationFramework.Luna, Version=3.0.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35;component/themes/luna.metallic.xaml",
                            UriKind.Relative);
                    break;
                //==================== AERO ======================================
                //C:\Program Files\Reference Assemblies\Microsoft\Framework\v3.0\PresentationFramework.Aero.dll
                //aero.normalcolor
                case ThemeEnum.AERO:
                    uri =
                        new Uri(
                            "/PresentationFramework.Aero, Version=3.0.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35;component/themes/aero.normalcolor.xaml",
                            UriKind.Relative);
                    break;
            }
            return Application.LoadComponent(uri) as ResourceDictionary;
        }
    }
}
