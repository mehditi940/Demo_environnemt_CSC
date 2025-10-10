public class StartStreamBody
{
    public IceServers[] iceServers { get; set; }
}

public class IceServers
{
       public string urls { get; set; }
}