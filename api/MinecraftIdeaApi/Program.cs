using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using MinecraftIdeaApi.Services;

var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults()
    .ConfigureServices((context, services) =>
    {
        services.Configure<CloudflareAiOptions>(context.Configuration.GetSection("CloudflareAI"));

        services.AddHttpClient("CloudflareAi", client =>
        {
            client.Timeout = TimeSpan.FromSeconds(15);
            client.DefaultRequestHeaders.Add("Accept", "application/json");
        });

        services.AddTransient<IMinecraftIdeaService, MinecraftIdeaService>();

    })
    .Build();

host.Run();