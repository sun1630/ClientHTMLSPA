using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime;
using System.Security;
using System.Security.Permissions;
using System.Text;

namespace BOC.UOP.Permissions
{
    [Serializable]
    internal class UserInitiatedNavigationPermission : InternalParameterlessPermissionBase
    {
        [TargetedPatchingOptOut("Performance critical to inline this type of method across NGen image boundaries")]
        public UserInitiatedNavigationPermission()
            : this(PermissionState.Unrestricted)
        {
        }
        [TargetedPatchingOptOut("Performance critical to inline this type of method across NGen image boundaries")]
        public UserInitiatedNavigationPermission(PermissionState state)
            : base(state)
        {
        }
        public override IPermission Copy()
        {
            return new UserInitiatedNavigationPermission();
        }
    }
}
