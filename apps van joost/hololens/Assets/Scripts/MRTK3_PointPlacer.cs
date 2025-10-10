using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.XR.Interaction.Toolkit.Interactors;

public class MRTK3_PointPlacer : MonoBehaviour
{
    [SerializeField]
    private GameObject pointPrefab; // Optional: your custom point prefab

    [SerializeField]
    private float pointSize = 0.02f;

    [SerializeField]
    private XRRayInteractor rayInteractor; // Assign via inspector or dynamically

    [SerializeField]
    private InputActionReference selectAction; // Bind to "Select" action from MRTK3 Input Actions

    private void OnEnable()
    {
        if (selectAction != null)
            selectAction.action.performed += OnSelectPerformed;
    }

    private void OnDisable()
    {
        if (selectAction != null)
            selectAction.action.performed -= OnSelectPerformed;
    }

    private void OnSelectPerformed(InputAction.CallbackContext context)
    {
        if (rayInteractor == null)
        {
            Debug.LogWarning("No Ray Interactor assigned.");
            return;
        }

        if (rayInteractor.TryGetCurrent3DRaycastHit(out RaycastHit hit))
        {
            PlacePoint(hit.point, hit.collider.gameObject);
        }
    }

    public void PlacePoint(Vector3 position, GameObject parentObject)
    {
        GameObject point;

        if (pointPrefab != null)
        {
            point = Instantiate(pointPrefab, position, Quaternion.identity);
        }
        else
        {
            point = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            point.transform.position = position;
            point.transform.localScale = Vector3.one * pointSize;
            Destroy(point.GetComponent<Collider>());
        }

        point.transform.SetParent(parentObject.transform);
    }
}
