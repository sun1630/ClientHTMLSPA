using BOC.UOP.Controls.WebBrowserEx;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BOCTS.Client.FrameWork
{
   public interface IWebBrowserService
    {
        void Initial();
        WebBrowserControl CreateWebBrowser();
    }
}
