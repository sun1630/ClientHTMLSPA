using System;
using System.Collections.Generic;
using System.Linq;
using System.Security;
using System.Security.Permissions;
using System.Text;

namespace BOC.UOP.Permissions
{
    internal abstract class InternalPermissionBase : CodeAccessPermission, IUnrestrictedPermission
    {
        public InternalPermissionBase()
        {
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
                throw new ArgumentException("InvalidPermissionType", base.GetType().FullName);
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
                throw new ArgumentException("InvalidPermissionType", base.GetType().FullName);
            }
            return true;
        }
    }
}
