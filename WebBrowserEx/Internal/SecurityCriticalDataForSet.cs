using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime;
using System.Security;
using System.Text;

namespace BOC.UOP.Internal
{
    [Serializable]
    public struct SecurityCriticalDataForSet<T>
    {
        [SecurityCritical]
        private T _value;
        internal T Value
        {
            [TargetedPatchingOptOut("Performance critical to inline this type of method across NGen image boundaries"), SecurityCritical, SecuritySafeCritical]
            get
            {
                return this._value;
            }
            [TargetedPatchingOptOut("Performance critical to inline this type of method across NGen image boundaries"), SecurityCritical]
            set
            {
                this._value = value;
            }
        }
        [TargetedPatchingOptOut("Performance critical to inline this type of method across NGen image boundaries"), SecurityCritical]
        internal SecurityCriticalDataForSet(T value)
        {
            this._value = value;
        }
    }
}
