using BOCTS.Client.FrameWork;
using Fluent;
using Microsoft.Practices.Prism.Regions;
using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BOCTS.Client.Controls.RibbonService
{
    [Export("RibbonService", typeof(IRibbonService))]
    public class RibbonService : IRibbonService
    {
        #region 成员
        Ribbon _Ribbon;
        #endregion

        #region 构造函数
        [ImportingConstructor()]
        public RibbonService(IRegionManager regionManager)
        {
            var ribbonRegion = regionManager.Regions[RegionNames.RibbonRegion];
            _Ribbon = ribbonRegion.GetView(RibbonRegionNames.RibbonView) as Ribbon;

            if (_Ribbon == null)
            {
                _Ribbon = new RibbonView(regionManager);

                ribbonRegion.Add(_Ribbon, RibbonRegionNames.RibbonView);
            }
            ribbonRegion.Activate(_Ribbon);
        }
        #endregion

        public void Initial()
        { }
        public object GetRibbonTab(string name)
        {
            throw new NotImplementedException();
        }

        public object GetRibbonTabByHeader(string header)
        {
            throw new NotImplementedException();
        }

        public void InsertrRibbonTab(object ribbonTab)
        {
            //here, has a bug ,if add a RibbonTabItem with RibbonContextualTabGroup before  the ribbon has one ribbonTabItem, will cause a Exception
            //but when the shell init, already create a start  RibbonTabItem, so, all looks well ....
            //see also:if there are only contextual tabs and no regular tabs https://fluent.codeplex.com/SourceControl/changeset/79e55b007593, seems not fixed....
            _Ribbon.Tabs.Add(ribbonTab as RibbonTabItem);
        }

        public void InsertRibbonContextualTabGroup(object ribbonContextualTabGroup)
        {
            _Ribbon.ContextualGroups.Add(ribbonContextualTabGroup as RibbonContextualTabGroup);
        }

        public object GetRibbonContextualTabGroupByHeader(string header)
        {
            throw new NotImplementedException();
        }
    }
}
