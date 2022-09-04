using System.Text.Json.Serialization;

namespace api
{
    internal class ReCaptchaVerifyResponse
    {
        [JsonPropertyName("success")]
        public bool Success { get; set; }
        [JsonPropertyName("score")]
        public float Score { get; set; }
        [JsonPropertyName("action")]
        public string Action { get; set; }
        [JsonPropertyName("timestamp")]
        public int Timestamp { get; set; }
        [JsonPropertyName("hostname")]
        public string Hostname { get; set; }
        [JsonPropertyName("error-codes")]
        public string[] ErrorCodes { get; set; }
    }
}
