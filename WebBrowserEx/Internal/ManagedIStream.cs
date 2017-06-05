using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Runtime.InteropServices.ComTypes;
using System.Security;
using System.Text;

namespace BOC.UOP.Internal
{
    internal class ManagedIStream : IStream
    {
        private Stream _ioStream;
        internal ManagedIStream(Stream ioStream)
        {
            if (ioStream == null)
            {
                throw new ArgumentNullException("ioStream");
            }
            this._ioStream = ioStream;
        }
        [SecurityCritical]
        void IStream.Read(byte[] buffer, int bufferSize, IntPtr bytesReadPtr)
        {
            int val = this._ioStream.Read(buffer, 0, bufferSize);
            if (bytesReadPtr != IntPtr.Zero)
            {
                Marshal.WriteInt32(bytesReadPtr, val);
            }
        }
        [SecurityCritical]
        void IStream.Seek(long offset, int origin, IntPtr newPositionPtr)
        {
            SeekOrigin origin2;
            switch (origin)
            {
                case 0:
                    origin2 = SeekOrigin.Begin;
                    break;
                case 1:
                    origin2 = SeekOrigin.Current;
                    break;
                case 2:
                    origin2 = SeekOrigin.End;
                    break;
                default:
                    throw new ArgumentOutOfRangeException("origin");
            }
            long val = this._ioStream.Seek(offset, origin2);
            if (newPositionPtr != IntPtr.Zero)
            {
                Marshal.WriteInt64(newPositionPtr, val);
            }
        }
        void IStream.SetSize(long libNewSize)
        {
            this._ioStream.SetLength(libNewSize);
        }
        void IStream.Stat(out System.Runtime.InteropServices.ComTypes.STATSTG streamStats, int grfStatFlag)
        {
            streamStats = default(System.Runtime.InteropServices.ComTypes.STATSTG);
            streamStats.type = 2;
            streamStats.cbSize = this._ioStream.Length;
            streamStats.grfMode = 0;
            if (this._ioStream.CanRead && this._ioStream.CanWrite)
            {
                streamStats.grfMode |= 2;
                return;
            }
            if (this._ioStream.CanRead)
            {
                streamStats.grfMode = streamStats.grfMode;
                return;
            }
            if (this._ioStream.CanWrite)
            {
                streamStats.grfMode |= 1;
                return;
            }
            throw new IOException("StreamObjectDisposed");
        }
        [SecurityCritical]
        void IStream.Write(byte[] buffer, int bufferSize, IntPtr bytesWrittenPtr)
        {
            this._ioStream.Write(buffer, 0, bufferSize);
            if (bytesWrittenPtr != IntPtr.Zero)
            {
                Marshal.WriteInt32(bytesWrittenPtr, bufferSize);
            }
        }
        void IStream.Clone(out IStream streamCopy)
        {
            streamCopy = null;
            throw new NotSupportedException();
        }
        void IStream.CopyTo(IStream targetStream, long bufferSize, IntPtr buffer, IntPtr bytesWrittenPtr)
        {
            throw new NotSupportedException();
        }
        void IStream.Commit(int flags)
        {
            throw new NotSupportedException();
        }
        void IStream.LockRegion(long offset, long byteCount, int lockType)
        {
            throw new NotSupportedException();
        }
        void IStream.Revert()
        {
            throw new NotSupportedException();
        }
        void IStream.UnlockRegion(long offset, long byteCount, int lockType)
        {
            throw new NotSupportedException();
        }
    }
}
