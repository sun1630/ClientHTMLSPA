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
    internal class CompoundFileIOPermission : InternalParameterlessPermissionBase
    {
        [TargetedPatchingOptOut("Performance critical to inline this type of method across NGen image boundaries")]
        public CompoundFileIOPermission()
            : this(PermissionState.Unrestricted)
        {
        }
        [TargetedPatchingOptOut("Performance critical to inline this type of method across NGen image boundaries")]
        public CompoundFileIOPermission(PermissionState state)
            : base(state)
        {
        }
        public override IPermission Copy()
        {
            return new CompoundFileIOPermission();
        }
    }
}
