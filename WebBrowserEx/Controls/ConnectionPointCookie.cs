using BOC.UOP.Internal;
using BOC.UOP.Win32;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Security;
using System.Text;

namespace BOC.UOP.Controls
{
    internal class ConnectionPointCookie
    {
        [SecurityCritical]
        private UnsafeNativeMethods.IConnectionPoint connectionPoint;
        private int cookie;
        [SecurityCritical]
        internal ConnectionPointCookie(object source, object sink, Type eventInterface)
        {
            Exception ex = null;
            if (source is UnsafeNativeMethods.IConnectionPointContainer)
            {
                UnsafeNativeMethods.IConnectionPointContainer connectionPointContainer = (UnsafeNativeMethods.IConnectionPointContainer)source;
                try
                {
                    Guid gUID = eventInterface.GUID;
                    if (connectionPointContainer.FindConnectionPoint(ref gUID, out this.connectionPoint) != 0)
                    {
                        this.connectionPoint = null;
                    }
                }
                catch (Exception ex2)
                {
                    if (CriticalExceptions.IsCriticalException(ex2))
                    {
                        throw;
                    }
                    this.connectionPoint = null;
                }
                if (this.connectionPoint == null)
                {
                    ex = new ArgumentException("AxNoEventInterface");
                }
                else
                {
                    if (sink == null || (!eventInterface.IsInstanceOfType(sink) && !Marshal.IsComObject(sink)))
                    {
                        ex = new InvalidCastException("AxNoSinkImplementation");
                    }
                    else
                    {
                        int num = this.connectionPoint.Advise(sink, ref this.cookie);
                        if (num != 0)
                        {
                            this.cookie = 0;
                            Marshal.FinalReleaseComObject(this.connectionPoint);
                            this.connectionPoint = null;
                            ex = new InvalidOperationException("AxNoSinkAdvise");
                        }
                    }
                }
            }
            else
            {
                ex = new InvalidCastException("AxNoConnectionPointContainer");
            }
            if (this.connectionPoint != null && this.cookie != 0)
            {
                return;
            }
            if (this.connectionPoint != null)
            {
                Marshal.FinalReleaseComObject(this.connectionPoint);
            }
            if (ex == null)
            {
                throw new ArgumentException("AxNoConnectionPoint");
            }
            throw ex;
        }
        [SecurityCritical]
        internal void Disconnect()
        {
            if (this.connectionPoint != null && this.cookie != 0)
            {
                try
                {
                    this.connectionPoint.Unadvise(this.cookie);
                }
                catch (Exception ex)
                {
                    if (CriticalExceptions.IsCriticalException(ex))
                    {
                        throw;
                    }
                }
                finally
                {
                    this.cookie = 0;
                }
                try
                {
                    Marshal.FinalReleaseComObject(this.connectionPoint);
                }
                catch (Exception ex2)
                {
                    if (CriticalExceptions.IsCriticalException(ex2))
                    {
                        throw;
                    }
                }
                finally
                {
                    this.connectionPoint = null;
                }
            }
        }
        [SecurityCritical, SecuritySafeCritical]
        ~ConnectionPointCookie()
        {
            this.Disconnect();
        }
    }
}
