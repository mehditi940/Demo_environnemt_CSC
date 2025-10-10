using System;
using System.Collections.Generic;

[Serializable]
public class RoomRequestBody
{
    public string id { get; set; }
    public string name { get; set; }
    public Patient patient { get; set; }
    public string type { get; set; }
    public string createdBy { get; set; }
    public string createdAt { get; set; }
    public string updatedAt { get; set; }
    public List<Model> models { get; set; }
}

[Serializable]
public class Patient
{
    public string id { get; set; }
    public string nummer { get; set; }
    public string firstName { get; set; }
    public string lastName { get; set; }
    public string createdAt { get; set; }
    public string updatedAt { get; set; }
}

[Serializable]
public class Model
{
    public string id { get; set; }
    public string name { get; set; }
    public string path { get; set; }
    public string addedBy { get; set; }
    public string roomId { get; set; }
    public string createdAt { get; set; }
}
