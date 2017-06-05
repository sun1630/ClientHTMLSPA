using System;
using System.Collections.Generic;
using System.Linq;
using System.Security;
using System.Security.Permissions;
using System.Text;

namespace BOC.UOP.Permissions
{
    [Serializable]
    internal abstract class InternalParameterlessPermissionBase : CodeAccessPermission, IUnrestrictedPermission
    {
        protected InternalParameterlessPermissionBase(PermissionState state)
        {
            if (state == PermissionState.Unrestricted)
                return;
            throw new ArgumentException("InvalidPermissionStateValue", "state");
        }
        public bool IsUnrestricted()
        {
            return true;
        }
        public override SecurityElement ToXml()
        {
            SecurityElement securityElement = new SecurityElement("IPermission");
            Type type = base.GetType();
            StringBuilder stringBuilder = new StringBuilder(type.Assembly.ToString());
            stringBuilder.Replace('"', '\'');
            securityElement.AddAttribute("class", type.FullName + ", " + stringBuilder);
            securityElement.AddAttribute("version", "1");
            return securityElement;
        }
        public override void FromXml(SecurityElement elem)
        {
        }
        public override IPermission Intersect(IPermission target)
        {
            if (target == null)
            {
                return null;
            }
            if (target.GetType() != base.GetType())
            {
                throw new ArgumentException("InvalidPermissionType", "target");
            }
            return this.Copy();
        }
        public override bool IsSubsetOf(IPermission target)
        {
            if (target == null)
            {
                return false;
            }
            if (target.GetType() != base.GetType())
            {
                throw new ArgumentException("InvalidPermissionType", "target");
            }
            return true;
        }
        public override IPermission Union(IPermission target)
        {
            if (target == null)
            {
                return null;
            }
            if (target.GetType() != base.GetType())
            {
                throw new ArgumentException("InvalidPermissionType", "target");
            }
            return this.Copy();
        }
    }
}
