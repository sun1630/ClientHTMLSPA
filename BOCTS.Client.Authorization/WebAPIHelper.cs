using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace BOCTS.Client.Authorization
{
    public class WebAPIHelper
    {
        public static JObject GetDataForAuthorization()
        {
            HttpClient client = new HttpClient();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            string url = "http://localhost:8327/api/xx";

            var json = "{ \"Name\": \"Test\" }";
            var httpContent = new StringContent(json, Encoding.UTF8);
            httpContent.Headers.ContentType = new MediaTypeHeaderValue("application/json");
            var response = client.PostAsync(url, httpContent).Result;
            if (!response.IsSuccessStatusCode)
            {
                throw new Exception(response.ToString());
            }
            return JObject.Parse(response.Content.ReadAsStringAsync().Result); 
        }
    }
}
