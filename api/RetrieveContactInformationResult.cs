using System;

namespace api
{
    public class RetrieveContactInformationResult
    {
        public string Email { get; set; }
        public Uri CallMeUri { get; set; }

        public RetrieveContactInformationResult(string email, Uri callMeUri)
        {
            this.Email = email;
            this.CallMeUri = callMeUri;
        }
    }
}
