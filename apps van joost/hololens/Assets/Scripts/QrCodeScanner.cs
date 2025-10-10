using System;
#if !WEBGL_BUILD
using Microsoft.MixedReality.OpenXR;
#endif
using UnityEngine;
using UnityEngine.SceneManagement;

public class QrCodeScanner : MonoBehaviour
{
    #if !WEBGL_BUILD
    private ARMarkerManager markerManager;
    #endif

    public string socketURL;
    public string roomId;

    private void Awake()
    {
        DontDestroyOnLoad(this);
        #if !WEBGL_BUILD
        markerManager = GetComponent<ARMarkerManager>();
        markerManager.markersChanged += OnMarkersChanged;
        #endif
        SceneManager.LoadScene("ViewerScreen");
    }

    void OnDestroy()
    {
        #if !WEBGL_BUILD
        markerManager.markersChanged -= OnMarkersChanged;
        #endif
    }

    #if !WEBGL_BUILD
    void OnMarkersChanged(ARMarkersChangedEventArgs args)
    {
        foreach (var marker in args.added)
        {
            string qrText = marker.GetDecodedString();

            // Try parsing as JSON
            try
            {
                var parsed = JsonUtility.FromJson<QRCodeData>(qrText);
                Debug.Log($"QR Data: roomId={parsed.roomId}, socketUrl={parsed.socketUrl}");
            }
            catch
            {
                Debug.Log($"Raw QR Code Text: {qrText}");
            }

            // Use marker.pose if you want to place an object at the QR code location
        }
    }
    #endif

    [Serializable]
    public class QRCodeData
    {
        public string roomId;
        public string socketUrl;
    }
}
