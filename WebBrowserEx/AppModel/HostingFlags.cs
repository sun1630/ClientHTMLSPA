using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BOC.UOP.AppModel
{
    [Flags]
    internal enum HostingFlags
    {
        hfHostedInIE = 1,
        hfHostedInWebOC = 2,
        hfHostedInIEorWebOC = 3,
        hfHostedInMozilla = 4,
        hfHostedInFrame = 8,
        hfIsBrowserLowIntegrityProcess = 16,
        hfInDebugMode = 32
    }
}
