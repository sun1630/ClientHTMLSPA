using BOC.UOP.Internal;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BOC.UOP.Utility
{
    internal static class BindUriHelper
    {
        public const int MAX_URL_LENGTH = 2083;
        private static Uri placeboBase = new Uri("http://microsoft.com/");
        private const int MAX_PATH_LENGTH = 2048;
        private const int MAX_SCHEME_LENGTH = 32;
        private const string PLACEBOURI = "http://microsoft.com/";
        private const string FRAGMENTMARKER = "#";
        //internal static Uri BaseUri
        //{
        //    get
        //    {
        //        return BaseUriHelper.BaseUri;
        //    }
        //    [SecurityCritical]
        //    set
        //    {
        //        BaseUriHelper.BaseUri = BaseUriHelper.FixFileUri(value);
        //    }
        //}
        internal static string UriToString(Uri uri)
        {
            if (uri == null)
            {
                throw new ArgumentNullException("uri");
            }
            return new StringBuilder(uri.GetComponents(uri.IsAbsoluteUri ? UriComponents.AbsoluteUri : UriComponents.SerializationInfoString, UriFormat.SafeUnescaped), 2083).ToString();
        }
        internal static bool DoSchemeAndHostMatch(Uri first, Uri second)
        {
            return SecurityHelper.AreStringTypesEqual(first.Scheme, second.Scheme) && first.Host.Equals(second.Host);
        }
        //internal static Uri GetResolvedUri(Uri baseUri, Uri orgUri)
        //{
        //    Uri result;
        //    if (orgUri == null)
        //    {
        //        result = null;
        //    }
        //    else
        //    {
        //        if (!orgUri.IsAbsoluteUri)
        //        {
        //            Uri baseUri2 = (baseUri == null) ? BindUriHelper.BaseUri : baseUri;
        //            result = new Uri(baseUri2, orgUri);
        //        }
        //        else
        //        {
        //            result = BaseUriHelper.FixFileUri(orgUri);
        //        }
        //    }
        //    return result;
        //}
        //internal static string GetReferer(Uri destinationUri)
        //{
        //    string result = null;
        //    Uri browserSource = SiteOfOriginContainer.BrowserSource;
        //    if (browserSource != null)
        //    {
        //        SecurityZone securityZone = CustomCredentialPolicy.MapUrlToZone(browserSource);
        //        SecurityZone securityZone2 = CustomCredentialPolicy.MapUrlToZone(destinationUri);
        //        if (securityZone == securityZone2 && SecurityHelper.AreStringTypesEqual(browserSource.Scheme, destinationUri.Scheme))
        //        {
        //            result = browserSource.GetComponents(UriComponents.AbsoluteUri, UriFormat.UriEscaped);
        //        }
        //    }
        //    return result;
        //}
        //[TargetedPatchingOptOut("Performance critical to inline this type of method across NGen image boundaries")]
        //internal static Uri GetResolvedUri(Uri originalUri)
        //{
        //    return BindUriHelper.GetResolvedUri(null, originalUri);
        //}
        //internal static Uri GetUriToNavigate(DependencyObject element, Uri baseUri, Uri inputUri)
        //{
        //    if (inputUri == null || inputUri.IsAbsoluteUri)
        //    {
        //        return inputUri;
        //    }
        //    if (BindUriHelper.StartWithFragment(inputUri))
        //    {
        //        baseUri = null;
        //    }
        //    Uri resolvedUri;
        //    if (baseUri != null)
        //    {
        //        if (!baseUri.IsAbsoluteUri)
        //        {
        //            resolvedUri = BindUriHelper.GetResolvedUri(BindUriHelper.GetResolvedUri(null, baseUri), inputUri);
        //        }
        //        else
        //        {
        //            resolvedUri = BindUriHelper.GetResolvedUri(baseUri, inputUri);
        //        }
        //    }
        //    else
        //    {
        //        Uri uri = null;
        //        if (element != null)
        //        {
        //            INavigator navigator = element as INavigator;
        //            if (navigator != null)
        //            {
        //                uri = navigator.CurrentSource;
        //            }
        //            else
        //            {
        //                NavigationService navigationService = element.GetValue(NavigationService.NavigationServiceProperty) as NavigationService;
        //                uri = ((navigationService == null) ? null : navigationService.CurrentSource);
        //            }
        //        }
        //        if (uri != null)
        //        {
        //            if (uri.IsAbsoluteUri)
        //            {
        //                resolvedUri = BindUriHelper.GetResolvedUri(uri, inputUri);
        //            }
        //            else
        //            {
        //                resolvedUri = BindUriHelper.GetResolvedUri(BindUriHelper.GetResolvedUri(null, uri), inputUri);
        //            }
        //        }
        //        else
        //        {
        //            resolvedUri = BindUriHelper.GetResolvedUri(null, inputUri);
        //        }
        //    }
        //    return resolvedUri;
        //}
        internal static bool StartWithFragment(Uri uri)
        {
            return uri.OriginalString.StartsWith("#", StringComparison.Ordinal);
        }
        internal static string GetFragment(Uri uri)
        {
            Uri uri2 = uri;
            string result = string.Empty;
            if (!uri.IsAbsoluteUri)
            {
                uri2 = new Uri(BindUriHelper.placeboBase, uri);
            }
            string fragment = uri2.Fragment;
            if (fragment != null && fragment.Length > 0)
            {
                result = fragment.Substring(1);
            }
            return result;
        }
        //internal static Uri GetUriRelativeToPackAppBase(Uri original)
        //{
        //    if (original == null)
        //    {
        //        return null;
        //    }
        //    Uri resolvedUri = BindUriHelper.GetResolvedUri(original);
        //    Uri packAppBaseUri = BaseUriHelper.PackAppBaseUri;
        //    return packAppBaseUri.MakeRelativeUri(resolvedUri);
        //}
        //internal static bool IsXamlMimeType(ContentType mimeType)
        //{
        //    return MimeTypeMapper.XamlMime.AreTypeAndSubTypeEqual(mimeType) || MimeTypeMapper.FixedDocumentSequenceMime.AreTypeAndSubTypeEqual(mimeType) || MimeTypeMapper.FixedDocumentMime.AreTypeAndSubTypeEqual(mimeType) || MimeTypeMapper.FixedPageMime.AreTypeAndSubTypeEqual(mimeType);
        //}
    }
}
