using Iter9.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Server.IIS.Core;
using System.Reflection;

namespace Iter9.Controllers;

[ApiController]
[Route("[controller]")]
public partial class Iter9Controller : ControllerBase
{
    private readonly Iter9Service iter9Service;

    public Iter9Controller(Iter9Service iter9Service)
    {
        this.iter9Service = iter9Service;
    }
}
