using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json.Serialization;

namespace api
{
    internal class ReCaptchaVerifyRequest
    {
        private const string SecretPropertyName = "secret";
        private const string ResponsePropertyName = "response";
        private const string RemoteIpPropertyName = "remoteip";

        [JsonPropertyName(SecretPropertyName)]
        public string Secret { get; set; }
        [JsonPropertyName(ResponsePropertyName)]
        public string Response { get; set; }
        [JsonPropertyName(RemoteIpPropertyName)]
        public string RemoteIp { get; set; }

        public FormUrlEncodedContent ToFormUrlEncodedContent()
        {
            var properties = new Dictionary<string, string>();
            if (!string.IsNullOrEmpty(Secret))
            {
                properties.Add(SecretPropertyName, Secret);
            }

            if (!string.IsNullOrEmpty(Response))
            {
                properties.Add(ResponsePropertyName, Response);
            }

            if (!string.IsNullOrEmpty(RemoteIp))
            {
                properties.Add(RemoteIpPropertyName, RemoteIp);
            }
            return new FormUrlEncodedContent(properties);
        }
    }
}
