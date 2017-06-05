using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BOCTS.Client.FrameWork
{
    [Flags]
    public enum AnchorableShowStrategy
    {
        Most = 1,
        Left = 2,
        Right = 4,
        Top = 16,
        Bottom = 32,
    }
}
