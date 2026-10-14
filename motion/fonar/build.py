"""Monta o loop 4:3 do card do FONAR a partir do vídeo da banca.

Uso: python3 build.py <fonar-banca-16x9.mp4> [saida.mp4]

Cada linha de segs.txt: nome, quadro inicial, quadro final, recorte (x y
largura altura, em px do vídeo 1920x1080) e máscara: F cobre o rodapé,
L<n> cobre as n primeiras colunas, - nada.
"""
import os
import subprocess
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
SRC = sys.argv[1]
SAIDA = sys.argv[2] if len(sys.argv) > 2 else 'master.mp4'
FPS = 30; X = 0.4; W, H = 1200, 900  # X: duração do fade entre trechos, em s
segs = [l.split() for l in open(os.path.join(AQUI, 'segs.txt')) if l.strip()]
inputs=[];filters=[];durs=[]
for i,(n,a,b,x,y,w,h,mask) in enumerate(segs):
    a,b=int(a),int(b); d=(b-a)/FPS; durs.append(d)
    inputs+=['-ss',f'{a/FPS:.4f}','-t',f'{d:.4f}','-i',SRC]
    f=f'[{i}:v]format=rgb24,'
    if mask=='F': f+='drawbox=x=0:y=1022:w=iw:h=58:color=0xFFF6EB:t=fill,'
    if mask.startswith('L'): f+=f'drawbox=x=0:y=0:w={mask[1:]}:h=ih:color=0xFFF6EB:t=fill,'
    f+=f'crop={w}:{h}:{x}:{y},scale={W}:{H}:flags=lanczos,setsar=1,fps={FPS},format=yuv420p,settb=AVTB[s{i}]'
    filters.append(f)
prev='s0'; off=0
for i in range(1,len(segs)):
    off+=durs[i-1]-X
    out=f'x{i}'
    filters.append(f'[{prev}][s{i}]xfade=transition=fade:duration={X}:offset={off:.4f}[{out}]')
    prev=out
total=sum(durs)-X*(len(segs)-1)
filters.append(f'[{prev}]fade=t=in:st=0:d=0.35:color=0xFFF6EB,fade=t=out:st={total-0.45:.3f}:d=0.45:color=0xFFF6EB[v]')
cmd=['ffmpeg','-nostdin','-v','error','-y',*inputs,'-filter_complex',';'.join(filters),'-map','[v]','-an','-c:v','libx264','-preset','slow','-crf','18','-pix_fmt','yuv420p',SAIDA]
subprocess.run(cmd,check=True); print('total',round(total,2),'s')
