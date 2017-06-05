using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;

namespace BOC.UOP.Controls
{
    [ComVisible(true)]
    [Guid("01AFBFE2-CA97-4F72-A0BF-E157038E4118")]
    public class NewWindowManager : BOC.UOP.Win32.UnsafeNativeMethods.INewWindowManager
    {
        public int EvaluateNewWindow(string pszUrl, string pszName,
            string pszUrlContext, string pszFeatures, bool fReplace, uint dwFlags, uint dwUserActionTime)
        {

            // use E_FAIL to be the same as CoInternetSetFeatureEnabled with FEATURE_WEBOC_POPUPMANAGEMENT
           
           // int hr = maskx.Interop.HRESULT.S_FALSE.Code; //Block
            int hr = BOC.UOP.Interop.HRESULT.S_OK.Code; //Allow all
            return hr;
        }
    }
}
