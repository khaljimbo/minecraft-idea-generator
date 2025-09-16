using MinecraftIdeaApi.Models;

namespace MinecraftIdeaApi.Services;

public interface IMinecraftIdeaService
{
    Task<MinecraftIdeaResponse> GenerateIdeaAsync(MinecraftIdeaRequest request, CancellationToken ct = default);
}