using UnityEngine;
using UnityEngine.UI;

public class WebGLTools : MonoBehaviour
{
    MRTK3_PointPlacer pointPlacer;

    private void Start()
    {
        pointPlacer = GameObject.Find("ModelSpawner").GetComponent<MRTK3_PointPlacer>();
    }

    void Update()
    {
        bool shiftPressed = Input.GetKey(KeyCode.LeftShift) || Input.GetKey(KeyCode.RightShift);
        if (!Input.GetKey(KeyCode.Mouse0) || !shiftPressed) return;

        Tool tool = ToolSelection.Instance.selectedTool;

        // Drawing tool
        if (tool == Tool.DrawTool && pointPlacer != null)
        {
            bool drawMode = GameObject.Find("Drawing Button").GetComponent<Toggle>().isOn;
            if (drawMode)
            {
                Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);
                if (Physics.Raycast(ray, out RaycastHit hit))
                {
                    pointPlacer.PlacePoint(hit.point, hit.collider.gameObject);
                }
            }
        }

        // Dragging tool
        if (tool == Tool.DragTool)
        {

        }
    }
}
