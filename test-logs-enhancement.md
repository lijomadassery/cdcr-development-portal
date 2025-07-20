# Testing Enhanced Logs Viewer

## Test Checklist

### 1. Dialog Size and Resizing
- [ ] Dialog opens at 85% viewport size (larger than before)
- [ ] Can resize dialog by dragging corners/edges
- [ ] Dialog maintains size after closing and reopening

### 2. Color Coding
Check that these elements are color-coded:

#### Log Levels
- [ ] ERROR/SEVERE/FATAL - Red
- [ ] WARN/WARNING - Orange
- [ ] INFO/INFORMATION - Blue
- [ ] DEBUG/TRACE/VERBOSE - Gray

#### Kubernetes Elements
- [ ] Timestamps - Blue/Light Blue
- [ ] Namespace references - Green
- [ ] Pod names - Orange
- [ ] JSON keys - Purple
- [ ] Quoted strings - Teal/Cyan
- [ ] Numbers - Orange

### 3. Word Wrap Toggle
- [ ] Word Wrap switch is visible in controls
- [ ] Default state is ON (wrapped text)
- [ ] When ON: Long lines wrap to fit dialog width
- [ ] When OFF: Long lines extend horizontally
- [ ] Horizontal scrollbar appears when word wrap is OFF

### 4. Other Features
- [ ] Search highlighting still works with color coding
- [ ] Follow mode still auto-scrolls to bottom
- [ ] Timestamps toggle still works
- [ ] Download button still exports logs
- [ ] Refresh button reloads logs

### 5. Deployment Logs Modal
- [ ] Same enhancements apply to "View All Logs" modal
- [ ] Tab switching between pods works correctly
- [ ] Each pod's logs show correct colors

## Test Data

To test color coding, look for logs containing:
- Error messages with "ERROR" or "Failed"
- Timestamps in ISO format (2025-07-20T12:34:56Z)
- JSON-like structures with key-value pairs
- Kubernetes namespaces and pod names

## Quick Test Commands

If you need to generate test logs:

```bash
# Generate error log
kubectl exec -it <pod-name> -n <namespace> -- sh -c "echo '[ERROR] 2025-07-20T12:34:56Z Failed to process request'"

# Generate JSON log
kubectl exec -it <pod-name> -n <namespace> -- sh -c 'echo "{\"level\":\"INFO\",\"timestamp\":\"2025-07-20T12:34:56Z\",\"message\":\"Processing request\",\"namespace\":\"default\"}"'

# Generate long line for word wrap test
kubectl exec -it <pod-name> -n <namespace> -- sh -c "echo 'This is a very long log line that should test the word wrap functionality when it is turned on and off. It should wrap when enabled and scroll horizontally when disabled.'"
```