using System;
using UnityEngine;

public class CommandLine : MonoBehaviour
{
    
    [SerializeField]
    private GameObject textPrefab;

    public void CreateNewLine(object obj)
    {
        GameObject newTextPrefab = Instantiate(textPrefab);
        newTextPrefab.GetComponent<TMPro.TextMeshProUGUI>().text = Convert.ToString(obj);
        newTextPrefab.transform.SetParent(this.transform);
    }
    
}
