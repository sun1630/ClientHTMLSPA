using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Security;
using System.Text;
using System.Threading;

namespace BOC.UOP.Internal
{
    internal static class CriticalExceptions
    {
        
        internal static bool IsCriticalException(Exception ex)
        {
            ex = CriticalExceptions.Unwrap(ex);
            return ex is NullReferenceException || ex is StackOverflowException || ex is OutOfMemoryException || ex is ThreadAbortException || ex is SEHException || ex is SecurityException;
        }
       
        internal static bool IsCriticalApplicationException(Exception ex)
        {
            ex = CriticalExceptions.Unwrap(ex);
            return ex is StackOverflowException || ex is OutOfMemoryException || ex is ThreadAbortException || ex is SecurityException;
        }
        
        internal static Exception Unwrap(Exception ex)
        {
            while (ex.InnerException != null && ex is TargetInvocationException)
            {
                ex = ex.InnerException;
            }
            return ex;
        }
    }
}
