using System.Text.Json.Serialization;

namespace api
{
    internal class RetrieveContactInformationRequest
    {
        [JsonPropertyName("challenge")]
        public string Challenge { get; set; }
    }
}
