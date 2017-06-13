using BOCTS.Client.FrameWork;
using Microsoft.Practices.Prism.Regions;
using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BOCTS.Client.Controls.Authorization
{
    [PartCreationPolicy(CreationPolicy.Shared)]
    [Export("AuthorizationService", typeof(IAuthorizationService))]
    public class AuthorizationService : IAuthorizationService
    {
        private IRegionManager _regionmanager = null;
 
        #region 构造函数
        [ImportingConstructor()]
        public AuthorizationService(IRegionManager regionManager)
        {
            _regionmanager = regionManager;
        }
        #endregion
        public void Show()
        {
            var _qurueregion = _regionmanager.Regions[RegionNames.QueueRegion];
            var _queueview = _qurueregion.GetView("QueueView") ;
            if(_queueview == null)
            {
                _queueview = new QueueWindow();
                _qurueregion.Add(_queueview, "QueueView");
            }
            _qurueregion.Activate(_queueview); 
        }
    }
}
