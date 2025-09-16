using System.IO;
using System.Linq;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MinecraftIdeaApi.Models;
using MinecraftIdeaApi.Services;

namespace MinecraftIdeaApi.Functions;

public class GenerateIdeaFunction
{
    private readonly IMinecraftIdeaService _service;
    private readonly IConfiguration _config;
    private readonly ILogger<GenerateIdeaFunction> _logger;

    public GenerateIdeaFunction(IMinecraftIdeaService service, IConfiguration config, ILogger<GenerateIdeaFunction> logger)
    {
        _service = service;
        _config = config;
        _logger = logger;
    }

    [Function("GenerateIdea")]
    public async Task<HttpResponseData> Run([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
    {

        var body = await new StreamReader(req.Body).ReadToEndAsync();
        var request = JsonSerializer.Deserialize<MinecraftIdeaRequest>(body, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new MinecraftIdeaRequest();

        try
        {
            var idea = await _service.GenerateIdeaAsync(request);
            var res = req.CreateResponse(HttpStatusCode.OK);
            res.Headers.Add("Content-Type", "application/json");
            await res.WriteStringAsync(JsonSerializer.Serialize(idea));
            return res;
        }
        catch (System.Exception ex)
        {
            _logger.LogError(ex, "Error generating idea");
            var problem = req.CreateResponse(HttpStatusCode.InternalServerError);
            await problem.WriteStringAsync(JsonSerializer.Serialize(new { error = "Failed to generate idea" }));
            return problem;
        }
    }
}