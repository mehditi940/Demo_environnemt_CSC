using System;
using System.Collections.Generic;
using System.Drawing;
using MixedReality.Toolkit.SpatialManipulation;
using UnityEngine;

public class ModelSpawner : MonoBehaviour
{
    public List<GameObject> modelPrefab;
    private int index = 0;

    [SerializeField]
    private Vector3 positionOffset = Vector3.zero;
    [SerializeField]
    private Vector3 rotationOffset = Vector3.zero;

    [SerializeField]
    private Vector3 targetSize = new Vector3(1f, 1f, 1f);


    private GameObject currentInstance;
    private ObjectManipulator objectManipulator;

    private void Start()
    {
        InstantiateAndFit();
        objectManipulator = gameObject.GetComponent<ObjectManipulator>();
    }

    // Call this method from other scripts or events
    public void InstantiateAndFit()
    {
        if (modelPrefab == null)
        {
            Debug.LogWarning("No model prefab assigned!");
            return;
        }

        if (currentInstance != null)
        {
            DestroyImmediate(currentInstance); // Replace existing instance
        }

        currentInstance = Instantiate(
            modelPrefab[index],
            transform.position + positionOffset,
            Quaternion.Euler(rotationOffset),
            this.transform
        );
        currentInstance.SetActive(true);
        ScaleToFit(currentInstance);
    }


    public void ResetSpawner()
    {
        index = 0;
        InstantiateAndFit();
    }

    public void SpanwNext()
    {
        index++;
        if(index >= modelPrefab.Count)
        {
            index = 0;
        }

        InstantiateAndFit();
    }

    public void SpawnPrevious()
    {
        index--;
        if (index <= 0) { 
            index = modelPrefab.Count - 1;
        }

        InstantiateAndFit();
    }

    void ScaleToFit(GameObject obj)
    {
        Renderer[] renderers = obj.GetComponentsInChildren<Renderer>();
        if (renderers.Length == 0) return;

        Bounds combinedBounds = renderers[0].bounds;
        for (int i = 1; i < renderers.Length; i++)
        {
            combinedBounds.Encapsulate(renderers[i].bounds);
        }

        Vector3 currentSize = combinedBounds.size;
        if (currentSize == Vector3.zero) return;

        float scaleX = targetSize.x / currentSize.x;
        float scaleY = targetSize.y / currentSize.y;
        float scaleZ = targetSize.z / currentSize.z;

        float scaleFactor = Mathf.Min(scaleX, scaleY, scaleZ);

        obj.transform.localScale *= scaleFactor;
    }

    public void RotateModel(RotateBody values)
    {
        currentInstance.transform.Rotate(new Vector3((float)values.horizontal, 0, (float)values.vertical), Space.Self);
    }

    public void LockModel(LockModelBody value)
    {
         objectManipulator.enabled = !value.value;
    }


    private List<GameObject> spawnedSpheres = new List<GameObject>();
    public void DrawOnModel(DrawBody drawBody)
    {
        if (drawBody == null || currentInstance == null) return;

        // Convert received coordinates into a Vector3
        Vector3 localPosition = new Vector3(
            (float)Convert.ToDouble(drawBody.x),
            (float)Convert.ToDouble(drawBody.y),
            (float)Convert.ToDouble(drawBody.z)
        );

        // Create a new sphere and parent it to the model
        GameObject newSphere = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        newSphere.transform.SetParent(currentInstance.transform); // parent to the model
        newSphere.transform.localPosition = localPosition;

        // Scale the sphere relative to the model’s scale (small clamped size)
        float baseScale = 0.05f; // base relative size
        newSphere.transform.localScale = Vector3.one * baseScale;

        // Optional: match model's rotation if you need aligned orientation
        newSphere.transform.localRotation = Quaternion.identity;

        spawnedSpheres.Add(newSphere);
    }


    private void Update()
    {
        DrawLinesBetweenSpheres();
    }

    private void DrawLinesBetweenSpheres()
    {
        if (spawnedSpheres.Count < 2)
            return;

        for (int i = 0; i < spawnedSpheres.Count - 1; i++)
        {
            Vector3 start = spawnedSpheres[i].transform.position;
            Vector3 end = spawnedSpheres[i + 1].transform.position;

            Debug.DrawLine(start, end, UnityEngine.Color.red);
        }
    }
}
