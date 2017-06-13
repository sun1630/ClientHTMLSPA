using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BOCTS.Client.Authorization
{
    //[PartCreationPolicy(CreationPolicy.Shared)]
    //[Export(typeof(IAuthorizationExecInterface))]
    public class AuthorizationExecInterface_A : IAuthorizationExecInterface
    { 
        public void Exec(object p_obj)
        {
            
        }
    }
}
