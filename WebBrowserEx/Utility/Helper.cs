using BOC.UOP.AppModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Reflection;
using System.Text;
using System.Windows.Interop;
using System.Windows.Navigation;

namespace BOC.UOP.Utility
{
    public static class Helper
    {
        public static NavigationEventArgs CreateNavigationEventArgs(Uri uri, object content, object extraData,
           WebResponse response, object Navigator, bool isNavigationInitiator)
        {
            Type t = typeof(NavigationEventArgs);
            ConstructorInfo ci = t.GetConstructor(BindingFlags.NonPublic | BindingFlags.Instance, null, new Type[]{
                typeof(Uri),
                typeof(object),
                typeof(object),
                typeof(WebResponse),
                typeof(object),
                typeof(bool)
            }, null);

            return ci.Invoke(new object[]{
                uri,content,extraData,response,Navigator,isNavigationInitiator
            }) as NavigationEventArgs;

        }
        public static NavigatingCancelEventArgs CreateNavigatingCancelEventArgs(Uri uri, object content, CustomContentState customContentState,
                object extraData, NavigationMode navigationMode, WebRequest request, object Navigator, bool isNavInitiator)
        {
            ConstructorInfo ci = typeof(NavigatingCancelEventArgs).GetConstructor(BindingFlags.NonPublic | BindingFlags.Instance, null,
                new Type[] { 
                typeof(Uri),
                typeof(object),
                typeof(CustomContentState),
                typeof(object),
                typeof(NavigationMode),
                typeof(WebRequest),
                typeof(object),
                typeof(bool)
                }, null);
            return ci.Invoke(new object[] { 
                uri,content,customContentState,extraData,navigationMode,request,Navigator,isNavInitiator
            }) as NavigatingCancelEventArgs;
        }
        internal static HostingFlags HostingFlags
        {
            get
            {
                var pi = typeof(BrowserInteropHelper).GetProperty("HostingFlags", BindingFlags.NonPublic);
                var obj = pi.GetValue(null, null);
                return (HostingFlags)obj;
            }
        }
        public static T GetProperty<T>(this object obj, string propertyName)
        {
            Type t = obj.GetType();
            PropertyInfo pi = t.GetProperty(propertyName, BindingFlags.NonPublic | BindingFlags.Static | BindingFlags.Instance);
            var p = pi.GetValue(obj, null);
            if (p == null)
                return default(T);
            return (T)p;
        }
    }

}
