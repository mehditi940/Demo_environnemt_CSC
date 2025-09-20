using System.Collections;
using UnityEngine;
using UnityEngine.Networking;
using ICSharpCode.SharpZipLib.Zip;
using Newtonsoft.Json;
using System.IO;
using System.Collections.Generic;
using System.Xml;
using System.Linq;

public class RoomLoader : MonoBehaviour
{
    private string baseUrl;
    private string AUTH_TOKEN;

    public string subfolderName = "DownloadedModels";
    public ModelSpawner spawner;

    public void setParameters(string url, string token)
    {
        baseUrl = url;
        AUTH_TOKEN = token;
    }

    /// <summary>
    /// Public method to start the request
    /// </summary>
    public void FetchData(string roomId)
    {
        StartCoroutine(SendAuthenticatedRequest(baseUrl + "/room/" + roomId));
    }

    /// <summary>
    /// Coroutine that sends an authenticated GET request and parses JSON
    /// </summary>
    private IEnumerator SendAuthenticatedRequest(string requestUrl)
    {

        Debug.Log("Requesting: " +  requestUrl);
        using (UnityWebRequest request = UnityWebRequest.Get(requestUrl))
        {
            request.SetRequestHeader("Authorization", "Bearer " + AUTH_TOKEN);

            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.ConnectionError ||
                request.result == UnityWebRequest.Result.ProtocolError)
            {
                Debug.LogError("Request Error: " + request.error);
            }
            else
            {
                string jsonText = request.downloadHandler.text;
                Debug.Log("Raw JSON: " + jsonText);

                RoomRequestBody roomBody = JsonConvert.DeserializeObject<RoomRequestBody>(jsonText);

                foreach (var model in roomBody.models)
                {
                    StartCoroutine(DownloadFileCoroutine(baseUrl + "/static/" + model.path, model.name, roomBody.id));
                }

                spawner.ResetSpawner();
            }
        }
    }

    IEnumerator DownloadFileCoroutine(string url, string saveAsFileName, string roomId)
    {
        UnityWebRequest request = UnityWebRequest.Get(url);
        request.SetRequestHeader("Authorization", "Bearer " + AUTH_TOKEN);

        string persistantFolder = Path.Combine(Application.persistentDataPath, subfolderName + "/" + roomId);
        Directory.CreateDirectory(persistantFolder);

        string localPath = Path.Combine(persistantFolder, saveAsFileName);

        Debug.Log("Downloading file from: " + url);

        yield return request.SendWebRequest();

        if (request.result != UnityWebRequest.Result.Success)
        {
            Debug.LogError("Download failed: " + request.error);
        }
        else
        {
            byte[] fileData = request.downloadHandler.data;
            File.WriteAllBytes(localPath, fileData);
            Debug.Log("File downloaded and saved to: " + localPath);
        }

        Load3MFModel(localPath, saveAsFileName);
    }

    void Load3MFModel(string path, string fileName)
    {
        using (FileStream fs = File.OpenRead(path))
        using (ZipFile zip = new ZipFile(fs))
        {
            foreach (ZipEntry entry in zip)
            {
                if (entry.Name.EndsWith(".model"))
                {
                    Stream modelStream = zip.GetInputStream(entry);
                    Parse3MFModelXml(modelStream, fileName);
                    return;
                }
            }
        }

        Debug.LogError("No .model file found in 3MF archive.");
    }

    void Parse3MFModelXml(Stream xmlStream, string fileName)
    {
        XmlDocument doc = new XmlDocument();
        doc.Load(xmlStream);

        XmlNamespaceManager ns = new XmlNamespaceManager(doc.NameTable);
        ns.AddNamespace("m", "http://schemas.microsoft.com/3dmanufacturing/core/2015/02");

        // Parse materials once for whole file
        Dictionary<int, Color> materials = new Dictionary<int, Color>();
        XmlNodeList baseMaterialNodes = doc.SelectNodes("//m:basematerials/m:base", ns);
        int matIndex = 0;
        foreach (XmlNode matNode in baseMaterialNodes)
        {
            string colorStr = matNode.Attributes["color"].Value; // e.g. #FF0000
            if (ColorUtility.TryParseHtmlString(colorStr, out Color c))
                materials.Add(matIndex++, c);
            else
                materials.Add(matIndex++, Color.white);
        }

        // Root GameObject for all imported objects
        GameObject root = new GameObject(fileName);

        XmlNodeList objectNodes = doc.SelectNodes("//m:object", ns);
        foreach (XmlNode objNode in objectNodes)
        {
            string objId = objNode.Attributes["id"]?.Value ?? "0";
            string objName = objNode.Attributes["name"]?.Value ?? ("Object_" + objId);

            XmlNode meshNode = objNode.SelectSingleNode("m:mesh", ns);
            if (meshNode == null)
                continue;

            // Parse vertices
            XmlNodeList vertexNodes = meshNode.SelectNodes("m:vertices/m:vertex", ns);
            List<Vector3> vertices = new List<Vector3>();
            foreach (XmlNode v in vertexNodes)
            {
                float x = float.Parse(v.Attributes["x"].Value);
                float y = float.Parse(v.Attributes["y"].Value);
                float z = float.Parse(v.Attributes["z"].Value);
                vertices.Add(new Vector3(x, y, z));
            }

            // Parse triangles and group by material
            XmlNodeList triangleNodes = meshNode.SelectNodes("m:triangles/m:triangle", ns);

            Dictionary<int, List<int>> submeshTris = new Dictionary<int, List<int>>();
            foreach (var key in materials.Keys)
                submeshTris[key] = new List<int>();

            List<int> defaultTris = new List<int>();

            foreach (XmlNode tri in triangleNodes)
            {
                int v1 = int.Parse(tri.Attributes["v1"].Value);
                int v2 = int.Parse(tri.Attributes["v2"].Value);
                int v3 = int.Parse(tri.Attributes["v3"].Value);

                int pid = tri.Attributes["pid"] != null ? int.Parse(tri.Attributes["pid"].Value) : -1;

                if (pid >= 0 && materials.ContainsKey(pid))
                {
                    submeshTris[pid].Add(v1);
                    submeshTris[pid].Add(v2);
                    submeshTris[pid].Add(v3);
                }
                else
                {
                    defaultTris.Add(v1);
                    defaultTris.Add(v2);
                    defaultTris.Add(v3);
                }
            }

            // Create mesh and GameObject for this object
            GameObject objGO = new GameObject(objName);
            objGO.transform.parent = root.transform;

            // Apply transform from 3MF
            string transformAttr = objNode.Attributes["transform"]?.Value;
            ThreeMFHelpers.ApplyTransform(objGO, transformAttr);

            Mesh mesh = new Mesh();
            mesh.vertices = vertices.ToArray();

            int submeshCount = materials.Count + (defaultTris.Count > 0 ? 1 : 0);
            mesh.subMeshCount = submeshCount;

            Material[] unityMaterials = new Material[submeshCount];

            int submeshIdx = 0;
            foreach (var kvp in submeshTris)
            {
                mesh.SetTriangles(kvp.Value.ToArray(), submeshIdx);
                unityMaterials[submeshIdx] = CreateMaterial(materials[kvp.Key]);
                submeshIdx++;
            }

            if (defaultTris.Count > 0)
            {
                mesh.SetTriangles(defaultTris.ToArray(), submeshIdx);
                unityMaterials[submeshIdx] = CreateMaterial(Color.gray);
            }

            mesh.RecalculateNormals();

            MeshFilter mf = objGO.AddComponent<MeshFilter>();
            MeshRenderer mr = objGO.AddComponent<MeshRenderer>();

            mf.mesh = mesh;
            mr.materials = unityMaterials;
        }

        root.transform.position = Vector3.zero;
        root.transform.parent = spawner.transform;
        root.SetActive(false);
        Debug.Log($"Loaded {objectNodes.Count} objects with materials and transforms.");
        spawner.modelPrefab.Add(root);
    }

    Material CreateMaterial(Color color)
    {
        Material mat = new Material(Shader.Find("Standard"));
        mat.color = color;
        return mat;
    }
}

public static class ThreeMFHelpers
{
    public static void ApplyTransform(GameObject obj, string transformAttr)
    {
        if (string.IsNullOrEmpty(transformAttr))
            return;

        string[] parts = transformAttr.Split(' ');
        if (parts.Length != 12)
        {
            Debug.LogWarning("Invalid transform attribute length: " + transformAttr);
            return;
        }

        // Build 4x4 matrix
        Matrix4x4 m = new Matrix4x4();

        // Row 0
        m.m00 = float.Parse(parts[0]);
        m.m01 = float.Parse(parts[1]);
        m.m02 = float.Parse(parts[2]);
        m.m03 = float.Parse(parts[3]);

        // Row 1
        m.m10 = float.Parse(parts[4]);
        m.m11 = float.Parse(parts[5]);
        m.m12 = float.Parse(parts[6]);
        m.m13 = float.Parse(parts[7]);

        // Row 2
        m.m20 = float.Parse(parts[8]);
        m.m21 = float.Parse(parts[9]);
        m.m22 = float.Parse(parts[10]);
        m.m23 = float.Parse(parts[11]);

        // Last row (3) of 4x4 matrix in Unity defaults to (0,0,0,1)
        m.m30 = 0f;
        m.m31 = 0f;
        m.m32 = 0f;
        m.m33 = 1f;

        // Extract position
        Vector3 position = new Vector3(m.m03, m.m13, m.m23);

        // Extract scale
        Vector3 scale = new Vector3(
            new Vector3(m.m00, m.m10, m.m20).magnitude,
            new Vector3(m.m01, m.m11, m.m21).magnitude,
            new Vector3(m.m02, m.m12, m.m22).magnitude);

        // Remove scale from rotation matrix columns
        Vector3 col0 = new Vector3(m.m00, m.m10, m.m20) / scale.x;
        Vector3 col1 = new Vector3(m.m01, m.m11, m.m21) / scale.y;
        Vector3 col2 = new Vector3(m.m02, m.m12, m.m22) / scale.z;

        // Create rotation matrix without scale
        Matrix4x4 rotationMatrix = new Matrix4x4();
        rotationMatrix.SetColumn(0, new Vector4(col0.x, col0.y, col0.z, 0));
        rotationMatrix.SetColumn(1, new Vector4(col1.x, col1.y, col1.z, 0));
        rotationMatrix.SetColumn(2, new Vector4(col2.x, col2.y, col2.z, 0));
        rotationMatrix.m33 = 1;

        Quaternion rotation = Quaternion.LookRotation(rotationMatrix.GetColumn(2), rotationMatrix.GetColumn(1));

        // Apply to object
        obj.transform.localPosition = position;
        obj.transform.localRotation = rotation;
        obj.transform.localScale = scale;
    }
}
