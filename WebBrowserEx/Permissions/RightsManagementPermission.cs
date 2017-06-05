using System;
using System.Collections.Generic;
using System.Linq;
using System.Security;
using System.Text;

namespace BOC.UOP.Permissions
{
    internal class RightsManagementPermission : InternalPermissionBase
    {
        public override IPermission Copy()
        {
            return new RightsManagementPermission();
        }
    }
}
