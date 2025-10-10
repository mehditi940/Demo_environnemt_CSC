using System;
using SocketIOClient;

public class User
{
    public string id { get; set; }
    public string email { get; set; }
    public string firstName { get; set; }
    public string role { get; set; }
}

public class UserBody
{
    public string roomId {  get; set; }
    public User user { get; set; }

}