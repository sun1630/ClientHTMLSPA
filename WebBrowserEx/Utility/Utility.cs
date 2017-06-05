using Microsoft.Practices.ServiceLocation;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;

namespace BOC.UOP.Controls.WebBrowserEx
{
    public static class Utility
    {
        public static T TryGetInstance<T>(string name)
        {
            T rtv = default(T);
            try
            {
                rtv = ServiceLocator.Current.GetInstance<T>(name);
            }
            catch
            {
            }
            return rtv;
        }
        static string favoritepath;
        public static string FavoritePath
        {
            get
            {
                if (string.IsNullOrEmpty(favoritepath))
                {
                    favoritepath = System.IO.Path.Combine(ConfigurationPath, @"favorite.xml");
                }
                return favoritepath;
            }
        }
        static string _ConfigurationPath;
        public static string ConfigurationPath
        {
            get
            {
                if (string.IsNullOrEmpty(_ConfigurationPath))
                {
                    _ConfigurationPath = typeof(Utility).Assembly.Location.ToLower().Replace(@"assembly\modules\boc.uop.controls.webbrowserex.dll", "Configuration");
                }
                return _ConfigurationPath;
            }
        }
        static string snaplocation;
        public static string SnapLocation
        {
            get
            {
                if (string.IsNullOrEmpty(snaplocation))
                {
                    snaplocation = System.IO.Path.Combine(ConfigurationPath, @"favoriteSnap");
                }
                return snaplocation;
            }
        }
        static string _MachineConfig;
        public static string MachineConfig
        {
            get
            {
                if (string.IsNullOrEmpty(_MachineConfig))
                {
                    _MachineConfig = System.IO.Path.Combine(ConfigurationPath, @"MachineConfig.xml");
                }
                return _MachineConfig;
            }
        }
        static bool? _ScriptErrorsSuppressed;
        public static bool ScriptErrorsSuppressed
        {
            get
            {
                if (!_ScriptErrorsSuppressed.HasValue)
                {
                    _ScriptErrorsSuppressed = true;
                    if (System.IO.File.Exists(Utility.MachineConfig))
                    {
                        var map = new ExeConfigurationFileMap();
                        map.ExeConfigFilename = Utility.MachineConfig;
                        var setting = ConfigurationManager.OpenMappedExeConfiguration(map, 0).AppSettings.Settings["ScriptErrorsSuppressed"];
                        if (setting != null)
                        {
                            bool temp;
                            if (bool.TryParse(setting.Value, out temp))
                            {
                                _ScriptErrorsSuppressed = temp;
                            }
                        }
                    }
                }

                return _ScriptErrorsSuppressed.Value;
            }
        }
    }
}
