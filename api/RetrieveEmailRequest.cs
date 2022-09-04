using System.Text.Json.Serialization;

namespace api
{
    internal class RetrieveEmailRequest
    {
        [JsonPropertyName("challenge")]
        public string Challenge { get; set; }
    }
}
