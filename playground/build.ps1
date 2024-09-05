# Script should be run with Powershell Core

# Ready the dataset
python dataset.py
# Train the model
python train.py
# Download convert.py
Invoke-WebRequest https://raw.githubusercontent.com/xenova/transformers.js/main/scripts/convert.py -OutFile convert.py

# Convert  the model
python convert.py --model_id flan-t5-termdef --task text2text-generation --quantize
# git clone https://github.com/microsoft/onnxruntime --depth 1 || true
# python .\onnxruntime\onnxruntime\python\tools\transformers\models\t5\convert_to_onnx.py --use_gpu -m flan-t5-termdef --output models/flan-t5-termdef-onnx
# Move-Item -Force -Path models/flan-t5-termdef-onnx/flan-t5-termdef_decoder.onnx -Destination models/flan-t5-termdef-onnx/decoder_model.onnx
# Move-Item -Force -Path models/flan-t5-termdef-onnx/flan-t5-termdef_encoder_decoder_init.onnx -Destination models/flan-t5-termdef-onnx/encoder_model.onnx

# Move the model to public for serving
Remove-Item -Recurse ../public/models
Copy-Item -Recurse models ../public/