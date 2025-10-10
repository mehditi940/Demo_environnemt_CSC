#if WEBGL_BUILD

using UnityEngine;
using UnityEngine.EventSystems;

public class WebGLModelManipulation : MonoBehaviour, IPointerDownHandler, IPointerUpHandler, IDragHandler
{
    private Vector2 lastMousePosition;
    private bool rotating = false;
    private bool zooming = false;

    public float rotationSpeed = 1f;
    public float zoomSpeed = 0.01f;
    public float minScale = 0.5f;
    public float maxScale = 1.5f;

    public void OnPointerDown(PointerEventData pointerEventData)
    {
        if (ToolSelection.Instance.selectedTool != Tool.DragTool) return;

        if (pointerEventData.button == PointerEventData.InputButton.Left)
        {
            rotating = true;
        }
        else if (pointerEventData.button == PointerEventData.InputButton.Middle)
        {
            zooming = true;
        }

        lastMousePosition = pointerEventData.position;
    }

    public void OnDrag(PointerEventData pointerEventData)
    {
        if (ToolSelection.Instance.selectedTool != Tool.DragTool) return;
        if (!rotating && !zooming) return;

        Vector2 delta = pointerEventData.position - lastMousePosition;
        lastMousePosition = pointerEventData.position;


        if (rotating)
        {
            transform.Rotate(Vector3.up, -delta.x * rotationSpeed, Space.World);
            transform.Rotate(Camera.main.transform.right, delta.y * rotationSpeed, Space.World);
        }
        else if (zooming)
        {
            float scaleDelta = delta.y * zoomSpeed;
            Vector3 newScale = transform.localScale + Vector3.one * scaleDelta;

            // Clamp scaling
            float clampedScale = Mathf.Clamp(newScale.x, minScale, maxScale);
            transform.localScale = Vector3.one * clampedScale;
        }
    }

    public void OnPointerUp(PointerEventData pointerEventData)
    {
        if (pointerEventData.button == PointerEventData.InputButton.Left)
        {
            rotating = false;
        }
        else if (pointerEventData.button == PointerEventData.InputButton.Middle)
        {
            zooming = false;
        }
    }
}

#endif