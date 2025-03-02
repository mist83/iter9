using Iter9.Services;
using Microsoft.AspNetCore.Mvc;

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
