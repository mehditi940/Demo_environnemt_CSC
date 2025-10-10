using UnityEngine;

public class WebGLCameraController : MonoBehaviour
{
    public float moveSpeed = 1f;
    public float lookSpeed = 1f;

    private GameObject webglCamera;
    private float cameraPitch = 0f;

    void Start()
    {
        webglCamera = transform.GetChild(0).gameObject;
    }

    void Update()
    {
        bool shiftPressed = Input.GetKey(KeyCode.LeftShift) || Input.GetKey(KeyCode.RightShift);

        // Movement
        float horizontalMovement = Input.GetAxis("Horizontal");
        float verticalMovement = Input.GetAxis("Vertical");
        float heightMovement = (Input.GetKey(KeyCode.Space) ? 1 : 0) - (Input.GetKey(KeyCode.C) ? 1 : 0);

        transform.Translate(new Vector3(horizontalMovement, heightMovement, verticalMovement) * moveSpeed * Time.deltaTime);

        // Show cursor and lock mouselook when shift is pressed for UI interaction
        if (shiftPressed)
        {
            Cursor.lockState = CursorLockMode.None;
            Cursor.visible = true;
        }
        else
        {
            Cursor.lockState = CursorLockMode.Locked;
            Cursor.visible = false;

            // Mouselook
            float mouseX = Input.GetAxis("Mouse X") * lookSpeed;
            float mouseY = Input.GetAxis("Mouse Y") * lookSpeed;
            transform.Rotate(0f, mouseX, 0f);
            cameraPitch -= mouseY;
            cameraPitch = Mathf.Clamp(cameraPitch, -85f, 85f);
            webglCamera.transform.localEulerAngles = new Vector3(cameraPitch, 0f, 0f);
        }
    }
}
