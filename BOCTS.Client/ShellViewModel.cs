using Microsoft.Practices.Prism.Regions;
using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Linq;
using System.Text;

namespace BOCTS.Client
{
    [Export]
    [PartCreationPolicy(CreationPolicy.Shared)]
    public class ShellViewModel //:  IPartImportsSatisfiedNotification 
    {
        readonly IRegionManager _regionManager;
        [ImportingConstructor]
        public ShellViewModel(IRegionManager regionManager)
        {
            _regionManager = regionManager;           
        }
        public void RequestNavigate(string regionName,string source)
        {
            _regionManager.RequestNavigate(regionName, source);
        }

        public void OnImportsSatisfied()
        {
            
        }
    }
}
