using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BOCTS.Client.FrameWork
{
    public interface IRibbonService
    {
        void Initial();
        object GetRibbonTab(string name);
        object GetRibbonTabByHeader(string header);
        void InsertrRibbonTab(object ribbonTab);
        void InsertRibbonContextualTabGroup(object ribbonContextualTabGroup);
        object GetRibbonContextualTabGroupByHeader(string header);

    }
}
