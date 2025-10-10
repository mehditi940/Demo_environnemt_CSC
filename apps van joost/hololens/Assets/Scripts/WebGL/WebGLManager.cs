using UnityEngine;

public class WebGLManager : MonoBehaviour
{
    private void Start()
    {
#if WEBGL_BUILD
        GameObject xrRig = GameObject.Find("MRTK XR Rig");
        if (xrRig != null)
        {
            xrRig.SetActive(false);
        }

        GameObject mrtkInputSim = GameObject.Find("MRTKInputSimulator");
        if (mrtkInputSim != null)
        {
            mrtkInputSim.SetActive(false);
        }

#else

        gameObject.SetActive(false);
#endif
    }
}
