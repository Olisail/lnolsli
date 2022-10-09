using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Net.Http;
using api;
using System.Text.Json;

namespace Captcha.Verify
{
    public static class RetrieveContactInformation
    {
        private const string Action = nameof(RetrieveContactInformation);

        private const string ReCaptchaSecretVariableName = "ReCaptchaSecret";
        private const string ContactEmailVariableName = "ContactEmail";
        private const string CallMeUriVariableName = "CallMeUri";
        private const string DefaultErrorMessage = "Error detected while validating the captcha.";

        private const float MinimalThreshold = 0.7F;

        private static readonly Uri RecaptchaVerifyEndpoint = new Uri("https://www.google.com/recaptcha/api/siteverify");

        [FunctionName(Action)]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("{Action} trigger function processed a request.", Action);

            var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var request = JsonSerializer.Deserialize<RetrieveContactInformationRequest>(requestBody);

            var recaptchaRequest = new ReCaptchaVerifyRequest
            {
                Response = request.Challenge,
                Secret = Environment.GetEnvironmentVariable(ReCaptchaSecretVariableName)
            };
            var recaptchaRequestMessage = new HttpRequestMessage(HttpMethod.Post, RecaptchaVerifyEndpoint);
            recaptchaRequestMessage.Content = recaptchaRequest.ToFormUrlEncodedContent();

            try
            {
                using var client = new HttpClient();
                var response = await client.SendAsync(recaptchaRequestMessage);
                var rawResult = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<ReCaptchaVerifyResponse>(rawResult);
                if (result?.Success != true)
                {
                    log.LogError("Error(s) detected: {concatenatedErrorCodes}", string.Join(',', result.ErrorCodes));
                    return new BadRequestObjectResult(DefaultErrorMessage);
                }

                if (result.Score < MinimalThreshold)
                {
                    log.LogWarning("Robot detected: threshold not met!");
                    return new BadRequestObjectResult(DefaultErrorMessage);
                }

                if (result.Action != Action)
                {
                    log.LogWarning("Error detected: wrong action, {actualAction} given", result.Action);
                    return new BadRequestObjectResult(DefaultErrorMessage);
                }

                log.LogInformation("Captcha validated!");
                return new OkObjectResult(
                    new RetrieveContactInformationResult(
                        email: Environment.GetEnvironmentVariable(ContactEmailVariableName),
                        callMeUri: new Uri(Environment.GetEnvironmentVariable(CallMeUriVariableName))
                    )
                );
            }
            catch (Exception ex)
            {
                const string error = "Error while processing the request";
                log.LogError(ex, error);
                return new BadRequestObjectResult(error);
            }
        }
    }
}
