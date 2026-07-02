import Vision
import AppKit

let path = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : ""
guard !path.isEmpty,
      let image = NSImage(contentsOfFile: path),
      let tiff = image.tiffRepresentation,
      let bitmap = NSBitmapImageRep(data: tiff),
      let cgImage = bitmap.cgImage else {
    fputs("failed to load image\n", stderr)
    exit(1)
}

let request = VNRecognizeTextRequest()
request.recognitionLevel = .accurate
request.recognitionLanguages = ["fr-FR", "en-US"]

let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
try handler.perform([request])

guard let observations = request.results else { exit(0) }
for obs in observations.sorted(by: { $0.boundingBox.origin.y > $1.boundingBox.origin.y }) {
    if let text = obs.topCandidates(1).first?.string {
        let box = obs.boundingBox
        print(String(format: "y=%.3f x=%.3f | %@", box.origin.y, box.origin.x, text))
    }
}