# Use the official .NET 8 SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the csproj file and restore dependencies
COPY ["gretora-backend/Gretora.API/Gretora.API.csproj", "gretora-backend/Gretora.API/"]
RUN dotnet restore "gretora-backend/Gretora.API/Gretora.API.csproj"

# Copy the rest of the source code and build the app
COPY . .
WORKDIR "/src/gretora-backend/Gretora.API"
RUN dotnet build "Gretora.API.csproj" -c Release -o /app/build

# Publish the app
FROM build AS publish
RUN dotnet publish "Gretora.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Use the official ASP.NET Core runtime image to run the app
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Expose port 80 for Render
EXPOSE 80
ENV ASPNETCORE_HTTP_PORTS=80
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "Gretora.API.dll"]
